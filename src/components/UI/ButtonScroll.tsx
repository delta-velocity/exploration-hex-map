'use client';

import React, { useMemo, useRef } from 'react';
import { create } from 'zustand';
import '../../css/buttonScroll.css';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DownloadIcon, PinBottomIcon, PinTopIcon, UploadIcon } from '@radix-ui/react-icons';

type ScrollPositionStore = {
    scrollPosition: number;
    scrollUp: () => void;
    scrollDown: () => void;
    setScrollPosition: (index: number) => void;
}

const useScrollPosition = create<ScrollPositionStore>((set) => ({
    scrollPosition: 1,
    scrollUp: () => set((state: { scrollPosition: number; }) => ({ scrollPosition: state.scrollPosition - 1 })),
    scrollDown: () => set((state: { scrollPosition: number; }) => ({ scrollPosition: state.scrollPosition + 1 })),
    setScrollPosition: (index: number) => set(() => ({ scrollPosition: index })),
}));

const transitionScrollTime = 250;
const sectionIndices = [0];

type ScrollButtonProps = {
    onClick: () => void;
    active: boolean;
    children: React.ReactNode;
    disabled: boolean;
    buttonRef: React.RefObject<HTMLButtonElement>;
    buttonStyle: React.CSSProperties;
};

const ScrollButton = ({ onClick, active, children, disabled, buttonRef, buttonStyle }: ScrollButtonProps) => {
    return (
        <button
            ref={buttonRef}
            disabled={disabled}
            className={`scroll-button-loop ${active ? 'active' : ''}`}
            onClick={!disabled ? onClick : () => { }}
            style={buttonStyle}
        >
            {children}
        </button>
    );
};

type ButtonScrollProps = {
    numButtons: number;
    buttonsVisible: number;
    sections: number[];
};

function ButtonScroll({ numButtons, buttonsVisible, sections }: ButtonScrollProps) {
    const { scrollPosition, setScrollPosition } = useScrollPosition();
    let currentIndex = 1;

    const buttonRefsByIndex = useMemo(() => {
        const refs = [];
        for (let index = 1; index <= numButtons; index++) {
            refs.push(React.createRef<HTMLButtonElement>());
        }
        return refs;
    }, [numButtons]);

    function handlePrevSection(scrollPosition: number, sectionIndices: number[]) {
        let nearestSectionIndex = sectionIndices.filter(start => start <= scrollPosition).length - 1;
        if (scrollPosition >= sectionIndices[nearestSectionIndex + 1] || nearestSectionIndex === 0) {
            nearestSectionIndex = Math.max(0, nearestSectionIndex - 1);
        }
        const newScrollPosition = sectionIndices[nearestSectionIndex + 1] - 1 || 0;
        return newScrollPosition;
    }

    function handleNextSection(scrollPosition: number, sectionIndices: number[], numButtons: number) {
        let nearestSectionIndex = sectionIndices.findIndex(start => start > scrollPosition);
        if (nearestSectionIndex === -1 || scrollPosition >= sectionIndices[numButtons - 1]) {
            return scrollPosition;
        }
        if (scrollPosition >= sectionIndices[nearestSectionIndex + 1]) {
            nearestSectionIndex++;
        }
        const newScrollPosition = sectionIndices[nearestSectionIndex + 1] - 1 || 0;
        return newScrollPosition;
    }

    const handlePrevClick = () => {
        const newScrollPosition = handlePrevSection(scrollPosition, sectionIndices);
        scrollTo(newScrollPosition);
    };

    const handleNextClick = () => {
        const newScrollPosition = handleNextSection(scrollPosition, sectionIndices, numButtons);
        scrollTo(newScrollPosition);
    };

    function findButtonHeightByIndices(indexOfButton: number, currentSelectedIndex: number) {
        let adjustedIndex = buttonsVisible + indexOfButton - currentSelectedIndex;
        adjustedIndex = Math.min(adjustedIndex, buttonsVisible * 2);
        adjustedIndex = Math.max(-2, adjustedIndex);
        return (190 + (60 * adjustedIndex));
    }

    function findButtonOpacityByIndices(indexOfButton: number, currentSelectedIndex: number) {
        const adjustedIndex = indexOfButton - currentSelectedIndex;
        return (1 - Math.abs(adjustedIndex / (buttonsVisible + 1)));
    }

    function scrollOnce(ascending: boolean, index: number) {
        if ((index === 1 && !ascending) || (index === numButtons && ascending)) {
            return [];
        }

        const buttonIndices = () => {
            const minIndex = Math.max(0, index - buttonsVisible - (ascending ? 1 : 2));
            const maxIndex = Math.min(index + buttonsVisible + (ascending ? 1 : 0), numButtons);
            return Array.from(
                { length: (maxIndex - minIndex) },
                (value, index) => minIndex + index
            );
        }

        const buttons = buttonIndices();

        buttons.forEach(index => {
            const element = buttonRefsByIndex[index];
            requestAnimationFrame(() => {
                element.current!.style.transition = `top ${transitionScrollTime}ms ease-in-out, opacity ${transitionScrollTime}ms ease-in-out`;
                element.current!.style.top = `${findButtonHeightByIndices(index, currentIndex)}px`;
                element.current!.style.opacity = findButtonOpacityByIndices(index + 1, currentIndex).toString();
            });
        });
    }

    function scrollTo(index: number) {
        currentIndex = scrollPosition;
        while (currentIndex !== index) {
            scrollOnce(currentIndex < index, currentIndex);
            currentIndex = index > currentIndex ? currentIndex + 1 : currentIndex - 1;
        }
        setScrollPosition(index);
    };

    const handleWheel = (event: React.WheelEvent) => {
        const delta = Math.sign(event.deltaY);
        let newPosition = scrollPosition + delta;
        newPosition = Math.max(1, Math.min(newPosition, numButtons));
        scrollTo(newPosition);
    };

    const handleButtonClick = (index: number) => {
        scrollTo(index);
    };

    const isButtonDisabled = (index: number) => {
        const distance = Math.abs(index - scrollPosition);
        return distance > buttonsVisible;
    };

    const buttons = Array.from({ length: numButtons }, (_, index) => {
        const buttonRef = buttonRefsByIndex[index];
        const buttonStyle: React.CSSProperties = {
            transition: `top ${transitionScrollTime}ms ease-in-out, opacity ${transitionScrollTime}ms ease-in-out`,
            top: `${findButtonHeightByIndices(index, scrollPosition)}px`,
            opacity: findButtonOpacityByIndices(index + 1, scrollPosition),
        };

        return (
            <ScrollButton
                key={index + 1}
                onClick={() => handleButtonClick(index + 1)}
                disabled={isButtonDisabled(index + 1)}
                active={scrollPosition === index + 1}
                buttonRef={buttonRef}
                buttonStyle={buttonStyle}
            >
                {index + 1}
            </ScrollButton>
        );
    });

    const scrollbarHeight = (buttonsVisible * 2 + 4) * 60 + 70;
    return (
        <Tooltip.Provider>
            <div className="scrollbar-container" onWheel={handleWheel} style={{ top: `${window.innerHeight / 2 - scrollbarHeight / 2}px`, left: '50px' }}>
                <div className="button-list" style={{ height: `${scrollbarHeight}px` }}>
                    <Tooltip.Root>
                        <Tooltip.Trigger className={`scroll-button`} onClick={() => handleButtonClick(1)} disabled={scrollPosition == 1} style={{ top: '10px', left: '10px' }}>
                            <UploadIcon />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="right" className="TooltipContent" sideOffset={5}>
                                Maximum Elevation
                                <Tooltip.Arrow className="TooltipArrow" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger className={`scroll-button`} onClick={handlePrevClick} style={{ top: '70px', left: '10px' }}>
                            <PinTopIcon />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="right" className="TooltipContent" sideOffset={5}>
                                {sections.indexOf(scrollPosition) > 0 ? "Layer Above" : "Layer Ceiling"}
                                <Tooltip.Arrow className="TooltipArrow" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    {buttons}
                    <Tooltip.Root>
                        <Tooltip.Trigger className={`scroll-button`} onClick={handleNextClick} style={{ bottom: '70px', left: '10px' }}>
                            <PinBottomIcon />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="right" className="TooltipContent" sideOffset={5}>
                                {sections.indexOf(scrollPosition + 1) > 0 ? "Layer Below" : "Layer Floor"}
                                <Tooltip.Arrow className="TooltipArrow" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Tooltip.Root>
                        <Tooltip.Trigger className={`scroll-button`} disabled={scrollPosition == numButtons} onClick={() => handleButtonClick(numButtons)} style={{ bottom: '10px', left: '10px' }}>
                            <DownloadIcon />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content side="right" className="TooltipContent" sideOffset={5}>
                                Minimum Elevation
                                <Tooltip.Arrow className="TooltipArrow" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </div>
            </div>
        </Tooltip.Provider>
    );
}

export default ButtonScroll;