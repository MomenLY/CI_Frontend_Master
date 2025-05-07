import { TroubleshootSharp } from "@mui/icons-material";

export const Onion = {
    isDebugMode: true, // Set this to false to turn off logging
    log: function(...args) {
      if (this.isDebugMode) {
        console.log(...args);
      }
    },
    error: function(...args) {
      if (this.isDebugMode) {
        console.error(...args);
      }
    },
  };