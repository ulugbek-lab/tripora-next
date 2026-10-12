import React from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';

const TViewer = ({ markdown }: { markdown: string }) => <Viewer key={markdown} initialValue={markdown} />;
export default TViewer;
