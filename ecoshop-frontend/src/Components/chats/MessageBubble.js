import { Box } from "@mui/material";

const MessageBubble = ({ type, content, timestamp, isAutoReply }) => {
  return (
    <Box className={`chat-message ${type}-message`}>
      <Box className="chat-message-content">
        {content}
        {isAutoReply && <div className="automated-reply-notice">Automated reply</div>}
      </Box>
    </Box>
  );
};

export default MessageBubble;
