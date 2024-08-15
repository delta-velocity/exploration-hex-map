'use client'

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Separator } from '@radix-ui/react-context-menu';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Cross2Icon, MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import "../../css/popup.css";

const DraggableWindow = ({ children, title, handleClose, startPosition }) => {
    // Reference to DraggableWindow
    const ref = useRef(null);
    // Reference to hidden content for dynamic sizing
    const contentRef = useRef(null);

    // Variables for animations or other visual effects
    const [minimized, setMinimized] = useState(false);
    const [intitial, setInitial] = useState(true);
    const [expandedSize, setExpandedSize] = useState({ width: 0, height: 0 });
    const minimizedSize = { width: 200, height: 35 }; // minimum values for minimized cards
    const opacityTime = 100; // trasition time for fade-in-out
    const expandTime = 250;

    const onMouseDown = (event) => {
        // Prevent text selection within the header while dragging
        event.preventDefault();

        if (ref.current) {
            const { left, top } = ref.current.getBoundingClientRect();
            let width = window.innerWidth;
            let height = window.innerHeight;
            let deltaX = event.clientX - left;
            let deltaY = event.clientY - top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseMove(moveEvent) {
                const { left, top } = ref.current.getBoundingClientRect();
                let newLeft = moveEvent.clientX - deltaX;
                let newTop = moveEvent.clientY - deltaY;
                newLeft = Math.min(newLeft, width - ref.current.clientWidth);
                newTop = Math.min(newTop, height - ref.current.clientHeight);
                newLeft = Math.max(0, newLeft);
                newTop = Math.max(0, newTop);

                ref.current.style.left = `${newLeft}px`;
                ref.current.style.top = `${newTop}px`;
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }
    };

    function toggleComponentSize(windowHeight, windowWidth) {
        ref.current.style.width = ref.current.offsetWidth + 'px';
        ref.current.style.height = ref.current.offsetHeight + 'px';

        let newWidth, newHeight, translateLeft, finalLeft, finalTop;
        const currentLeft = parseInt(ref.current.style.left);
        const currentTop = parseInt(ref.current.style.top);
        if (minimized) {
            newWidth = expandedSize.width;
            newHeight = expandedSize.height;
            translateLeft = (minimizedSize.width - expandedSize.width) / 2;
            finalLeft = Math.min(Math.max(currentLeft + translateLeft, 0), windowWidth - expandedSize.width);
            finalTop = Math.min(Math.max(currentTop, 0), windowHeight - expandedSize.height);
        } else {
            newWidth = minimizedSize.width;
            newHeight = minimizedSize.height;
            translateLeft = (expandedSize.width - minimizedSize.width) / 2;
            finalLeft = currentLeft + translateLeft;
            finalTop = currentTop;
        }

        // Animate the transition
        ref.current.style.transition = `width ${expandTime}ms ease-in-out, height ${expandTime}ms ease-in-out, left ${expandTime}ms ease-in-out, top ${expandTime}ms ease-in-out`;

        if (minimized) {
            requestAnimationFrame(() => {
                ref.current.style.width = newWidth + 'px';
                ref.current.style.height = newHeight + 'px';
                ref.current.style.left = finalLeft + 'px';
                ref.current.style.top = finalTop + 'px';
            });

            setTimeout(() => {
                showContent(contentRef);
                ref.current.style.transition = 'left 0ms';
            }, expandTime);
        } else {
            hideContent(contentRef);

            setTimeout(() => {
                requestAnimationFrame(() => {
                    ref.current.style.width = newWidth + 'px';
                    ref.current.style.height = newHeight + 'px';
                    ref.current.style.left = finalLeft + 'px';
                    ref.current.style.top = finalTop + 'px';
                });
            }, opacityTime);
            setTimeout(() => {
                ref.current.style.transition = 'left 0ms';
            }, opacityTime + expandTime);
        }
    }

    function showContent(ref) {
        ref.current.style.transition = `opacity ${opacityTime}ms ease-in-out`;
        requestAnimationFrame(() => {
            ref.current.style.opacity = 1;
        });
    }

    function hideContent(ref) {
        ref.current.style.transition = `opacity ${opacityTime}ms ease-in-out`;
        requestAnimationFrame(() => {
            ref.current.style.opacity = 0;
        });
    }

    useLayoutEffect(() => {
        if (ref.current) {
            if (intitial) {
                setInitial(false);
                setTimeout(() => {
                    const style = getComputedStyle(contentRef.current);
                    setExpandedSize({
                        width: parseInt(style.getPropertyValue('--radix-collapsible-content-width').slice(0, -2)),
                        height: parseInt(style.getPropertyValue('--radix-collapsible-content-height').slice(0, -2)) + 30
                    });
                }, 1);
            }
        }
    });

    useEffect(() => {
        const width = expandedSize.width;
        const screenEdgeBottom = window.innerHeight;
        const screenEdgeRight = window.innerWidth;
        const left = startPosition.x - (width / 2);
        const top = startPosition.y - (35 / 2);

        const newLeft = Math.max(0, Math.min(left, screenEdgeRight - (ref.current.clientWidth)));
        const newTop = Math.max(0, Math.min(top, screenEdgeBottom - (ref.current.clientHeight)));

        ref.current.style.left = newLeft + 'px';
        ref.current.style.top = newTop + 'px';

        showContent(ref);
    }, [expandedSize]);

    return (
        <div ref={ref} className="draggable-window" onMouseDown={onMouseDown}>
            <Tooltip.Provider>
                <div className="DialogContent">
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <button className="CloseButton" aria-label="Close" onClick={() => {
                                hideContent(ref);
                                setTimeout(() => {
                                    handleClose();
                                }, opacityTime);
                            }}>
                                <Cross2Icon />
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content className="TooltipContent" sideOffset={5}>
                                Close
                                <Tooltip.Arrow className="TooltipArrow" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                    <Collapsible.Root defaultOpen={true}>
                        <Collapsible.Trigger asChild>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button className="IconButton" aria-label="Minimize" onClick={(e) => {
                                        toggleComponentSize(window.innerHeight, window.innerWidth);
                                        setMinimized(!minimized);
                                    }}>
                                        {minimized ? <PlusIcon /> : <MinusIcon />}
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="TooltipContent" sideOffset={5}>
                                        Minimize
                                        <Tooltip.Arrow className="TooltipArrow" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Collapsible.Trigger>
                        <div className="DialogTitle">{title}</div>
                        <Collapsible.Content ref={contentRef} className="window-content">
                            <Separator className="ContextMenuSeparator" style={{ top: "5px" }} />
                            {children}
                        </Collapsible.Content>
                    </Collapsible.Root>
                </div>
            </Tooltip.Provider>
        </div >
    );
};

export default DraggableWindow;