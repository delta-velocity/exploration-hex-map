'use client'

import * as ContextMenu from '@radix-ui/react-context-menu';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import React, { useState, useEffect } from 'react';
import DraggableWindow from './UI/Popup.tsx';
import { selectHexagon } from '../helpers/hexes.js'
import '../css/contextMenu.css';
import dynamic from 'next/dynamic';
import { FileUpload, ObjectDownload } from './UI/FileIO';
const ButtonScroll = dynamic(() => import('./UI/ButtonScroll.tsx'), {
    ssr: false
});


function HexMapContextMenu({ children, panOffset = {}, hexSize = 40 }) {
    const [tileExists, setTileExists] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [clickHexPosition, setClickHexPosition] = useState({ q: 0, r: 0 });
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [buttonsVisible, setButtonsVisible] = useState(0);

    const changeZoom = (event) => {
    };

    const handleContextMenu = (event) => {
        const q_r = selectHexagon(event.clientX, event.clientY, hexSize, panOffset.x, panOffset.y);
        setClickPosition({ x: event.clientX, y: event.clientY });
        setClickHexPosition(q_r);
        setIsAddOpen(false);
        setIsEditOpen(false);
    };

    const handleContextSelect = (event) => {
        setClickPosition({ x: event.clientX, y: event.clientY });
    }

    const handleColorChange = (event) => {
        console.log(event.target.value.hex);
        setFormData({
            ...formData,
            [event.target.name]: event.target.value.hex,
        });
    };

    // useEffect and return
    useEffect(() => {
        setTileExists(true);
        setButtonsVisible(Math.floor((window.innerHeight - 350) / 120));
    }, [clickPosition]);

    const [inputValue, setInputValue] = useState(''); // Initialize input value state

    const handleInputChange = (e) => {
        setInputValue(e.target.value); // Update input value state on change
    };

    const handleSubmit = () => {
        // Call the update function here, passing the inputValue
        // For example: updateStore(inputValue);
        setIsEditOpen(false); // Close the popup after submitting
    };

    const handleCancel = () => {
        setIsEditOpen(false); // Close the popup on cancel
    };

    const [fileContent, setFileContent] = useState('');

    const handleFileRead = (content) => {
        console.log(content);
        setFileContent(content);
    };
    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger onContextMenu={(e) => handleContextMenu(e)}>
                {children}

                {isAddOpen && (
                    <DraggableWindow title="Add Hex" handleClose={() => setIsAddOpen(false)} startPosition={clickPosition}>
                        <div>
                            <h1>File Upload Example</h1>
                            <FileUpload onFileRead={handleFileRead} />
                            {fileContent && (
                                <div>
                                    <h2>File Content:</h2>
                                    <pre>{fileContent.length}</pre>
                                </div>
                            )}
                            <ObjectDownload object={fileContent} fileName='data' />
                        </div>
                    </DraggableWindow>
                )}

                {isEditOpen && (
                    <DraggableWindow title="Edit Hex" handleClose={() => setIsEditOpen(false)} startPosition={clickPosition}>
                        <h2>Edit Data</h2>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Enter new value"
                        />
                        <button onClick={handleSubmit}>Submit</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </DraggableWindow>
                )}

                <ButtonScroll numButtons={18} buttonsVisible={buttonsVisible} sections={[1, 4, 7]}></ButtonScroll>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className="ContextMenuContent" sideOffset={5} align="end">
                    <ContextMenu.Item className="ContextMenuInfo" disabled={true}>Hex: ({clickHexPosition.q}, {clickHexPosition.r})</ContextMenu.Item>
                    <ContextMenu.Separator className="ContextMenuSeparator" />

                    <ContextMenu.Item className="ContextMenuItem" disabled={!tileExists} onClick={(e) => { setIsAddOpen(true); handleContextSelect(e) }}>Add</ContextMenu.Item>
                    <ContextMenu.Item className="ContextMenuItem" disabled={!tileExists}>Delete</ContextMenu.Item>
                    <ContextMenu.Sub>
                        <ContextMenu.SubTrigger className="ContextMenuSubTrigger" disabled={!tileExists}>
                            Edit
                            <div className="RightSlot">
                                <ChevronRightIcon />
                            </div>
                        </ContextMenu.SubTrigger>
                        <ContextMenu.Portal>
                            <ContextMenu.SubContent
                                className="ContextMenuSubContent"
                                sideOffset={2}
                                alignOffset={-5}
                            >
                                <ContextMenu.Item className="ContextMenuItem" onClick={(e) => { setIsEditOpen(true); handleContextSelect(e) }}>Edit All</ContextMenu.Item>
                            </ContextMenu.SubContent>
                        </ContextMenu.Portal>
                    </ContextMenu.Sub>

                    <ContextMenu.Item className="ContextMenuItem" onClick={changeZoom}>Zoom</ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}

export default HexMapContextMenu;