import { Box } from "@mui/material";

const MessageBubble = ({ type, content, timestamp, isAutomated }) => {
  return (
    <Box
      className={`chat-message ${type}-message`}
    >
      <Box className="chat-message-content">
        {content}
        {isAutomated && <div className="automated-reply-notice">Automated reply</div>}
      </Box>
    </Box>
  );
};

export default MessageBubble;
