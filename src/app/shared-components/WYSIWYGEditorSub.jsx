
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { convertToRaw, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import clsx from "clsx";


import './WYSIWYGEditorSub.css';
import { fontSize } from "@mui/system";


/**
 * The root component of the WYSIWYG editor.
 */
const Root = styled("div")({
  "& .rdw-dropdown-selectedtext": {
    color: "inherit",
  },
  "& .rdw-editor-toolbar": {
    borderWidth: "0 0 1px 0!important",
    margin: "0!important",
  },
  "& .rdw-editor-main": {
    padding: "8px 12px",
    maxHeight: `${150}px!important`,
    minHeight: `${150}px!important`,
    wordBreak: "break-word", 
    whiteSpace: "normal", 

  },
});

/**
 * The WYSIWYG editor component.
 */
function WYSIWYGEditorComponent(props, ref) {
  const { onChange, className = "" } = props;
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  /**
   * The function to call when the editor state changes.
   */
  function onEditorStateChange(_editorState) {
    setEditorState(_editorState);
    return onChange(
      draftToHtml(convertToRaw(_editorState.getCurrentContent()))
    );
  }






  return (
    <Root
      className={clsx("w-full overflow-hidden rounded-4 border-1 custom-editor", className)}
      ref={ref}
    >
      <Editor className=""
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        toolbar={{
          // options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'history'],

          // options: ["inline", "list", "link", "history"],
          options: ["history", "inline"],

          inline: {
            options: [
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "monospace",
            ],
            // options: [
            //   "bold",
            //   "italic",
            //   "underline",
            // ],

            // bold: { icon: boldImg, className: "demo-option-custom" },
          },

        }}
      />
    </Root>
  );
}

const WYSIWYGEditorSub = React.forwardRef(WYSIWYGEditorComponent);
export default WYSIWYGEditorSub;


