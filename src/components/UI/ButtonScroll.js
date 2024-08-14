'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { create } from 'zustand';
import '../../css/buttonScroll.css';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DownloadIcon, PinBottomIcon, PinTopIcon, UploadIcon } from '@radix-ui/react-icons';

const useScrollPosition = create((set) => ({
    scrollPosition: 1,
    scrollUp: () => set((state) => ({ scrollPosition: state.scrollPosition - 1 })),
    scrollDown: () => set((state) => ({ scrollPosition: state.scrollPosition + 1 })),
    setScrollPosition: (index) => set(() => ({ scrollPosition: index })),
}));
const transitionScrollTime = 250;
const sectionIndices = [1, 5, 14];

const ScrollButton = ({ onClick, active, children, disabled, buttonRef, buttonStyle }) => {
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

const ControlButton = React.forwardRef(({ onClick, children, disabled, style }, ref) => {
    return (
        <button
            ref={ref} // Attach the forwarded ref
            disabled={disabled}
            className={`scroll-button`}
            onClick={!disabled ? onClick : () => { }}
            style={style}
        >
            {children}
        </button>
    );
});

function ButtonScroll({ numButtons, buttonsVisible, sections }) {
    const { scrollPosition, setScrollPosition } = useScrollPosition();
    let currentIndex = 1;

    const buttonRefsByIndex = useMemo(() => {
        const refs = [];
        for (let index = 1; index <= numButtons; index++) {
            refs.push(React.createRef(null));
        }

        return refs;
    }, [numButtons]);

    function handlePrevSection(scrollPosition, sectionIndices) {
        // Find nearest section start BELOW or EQUAL to current position
        let nearestSectionIndex = sectionIndices.filter(start => start <= scrollPosition).length - 1;

        // If already at the bottom of a section or at the start of the first, go to the previous section's bottom
        if (
            scrollPosition >= sectionIndices[nearestSectionIndex + 1] ||
            nearestSectionIndex === 0
        ) {
            nearestSectionIndex = Math.max(0, nearestSectionIndex - 1); // Prevent negative
        }

        const newScrollPosition = sectionIndices[nearestSectionIndex + 1] - 1 || 0; // Subtract 1 to target the bottom
        return newScrollPosition;
    }

    function handleNextSection(scrollPosition, sectionIndices, numButtons) {
        // Find nearest section start ABOVE the current position
        let nearestSectionIndex = sectionIndices.findIndex(start => start > scrollPosition);

        // If already at the bottom of the last section, stay there
        if (nearestSectionIndex === -1 || scrollPosition >= sectionIndices[numButtons - 1]) {
            return scrollPosition;
        }

        // If already at the bottom of a section, go to the next section's bottom 
        if (scrollPosition >= sectionIndices[nearestSectionIndex + 1]) {
            nearestSectionIndex++;
        }

        const newScrollPosition = sectionIndices[nearestSectionIndex + 1] - 1 || 0; // Subtract 1 to target the bottom
        return newScrollPosition;
    }

    const handlePrevClick = () => {
        const newScrollPosition = handlePrevSection(scrollPosition, sectionIndices);
        scrollTo(newScrollPosition);
    };

    const handleNextClick = () => {
        const newScrollPosition = handleNextSection(scrollPosition, sectionIndices);
        scrollTo(newScrollPosition);
    };

    function findButtonHeightByIndices(indexOfButton, currentSelectedIndex) {
        let adjustedIndex = buttonsVisible + indexOfButton - currentSelectedIndex;
        adjustedIndex = Math.min(adjustedIndex, buttonsVisible * 2);
        adjustedIndex = Math.max(-2, adjustedIndex);
        return (190 + (60 * adjustedIndex));
    }

    function findButtonOpacityByIndices(indexOfButton, currentSelectedIndex) {
        const adjustedIndex = indexOfButton - currentSelectedIndex;
        return (1 - Math.abs(adjustedIndex / (buttonsVisible + 1)));
    }

    function scrollOnce(ascending, index) {
        if ((index === 1 && !ascending) || (index === numButtons) && ascending) {
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
                element.current.style.transition = `top ${transitionScrollTime}ms ease-in-out, opacity ${transitionScrollTime}ms ease-in-out`;
                element.current.style.top = `${findButtonHeightByIndices(index, currentIndex)}px`;
                element.current.style.opacity = findButtonOpacityByIndices(index + 1, currentIndex);
            });
        });
    }

    function scrollTo(index) {
        currentIndex = scrollPosition;
        while (currentIndex !== index) {
            scrollOnce(currentIndex < index, currentIndex);
            currentIndex = index > currentIndex ? currentIndex + 1 : currentIndex - 1;
        }

        setScrollPosition(index);
    };

    const handleWheel = (event) => {
        const delta = Math.sign(event.deltaY); // Positive for down, negative for up

        let newPosition = scrollPosition + delta;
        newPosition = Math.max(1, Math.min(newPosition, numButtons)); // Clamp within bounds


        scrollTo(newPosition);
    };

    const handleButtonClick = (index) => {
        scrollTo(index);
    };

    const handleSectionScroll = (ascending) => {
        const sectionIndex = sections.findIndex((value) => {
            return value > scrollPosition;
        });
        const isSectionIndex = sections.indexOf(scrollPosition) > 0;
        if (sectionIndex < 0) {

        }
    }

    const isButtonDisabled = (index) => {
        const distance = Math.abs(index - scrollPosition);
        return distance > buttonsVisible;
    };

    const buttons = Array.from({ length: numButtons }, (_, index) => {

        const buttonRef = buttonRefsByIndex[index];
        const buttonStyle = {
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
                index={index + 1}
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