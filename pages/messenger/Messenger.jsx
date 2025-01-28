import { useContext, useEffect, useRef, useState } from "react";
import { Conversation } from "../../components/conversation/Conversation";
import { Message } from "../../components/message/Message";
import { Button } from "@mui/material";
import { ChatOnline } from "../../components/chatOnline/ChatOnline";
import { io } from "socket.io-client";
import "./messenger.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef(io("ws://localhost:3000"));

  const scrollRef = useRef();

  const { user } = useContext(AuthContext);

  // Socket.IO event to receive new message
  useEffect(() => {
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  // Updating messages when a new one arrives
  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Fetching user conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get(`/conversations/${user._id}`);
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getConversations();
  }, [user._id]);

  // Adding user to socket and getting online users
  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);

  // Fetching messages for the current conversation
  useEffect(() => {
    const getMessages = async () => {
      if (currentChat?._id) {
        try {
          const res = await axios.get(`/message/${currentChat._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    getMessages();
  }, [currentChat]);

  // Sending a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat?._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/message", message);
      setMessages((prevMessages) => [...prevMessages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-scrolling to the latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messenger">
      <div className="chat-menu">
        <div className="chat-menu-wrapper">
          <input
            type="text"
            className="chat-menu-input"
            placeholder="Search for Friends"
          />
          {conversations.map((c) => (
            <div onClick={() => setCurrentChat(c)} key={c._id}>
              <Conversation conversation={c} currentUser={user} />
            </div>
          ))}
        </div>
      </div>

      <form className="chat-box" onSubmit={handleSubmit}>
        <div className="chat-box-wrapper">
          {currentChat ? (
            <>
              <div className="chat-box-top">
                {messages.map((m, index) => (
                  <div ref={scrollRef} key={index}>
                    <Message
                      message={m}
                      own={m.sender === user._id}
                      user={user}
                      currentChat={currentChat}
                    />
                  </div>
                ))}
              </div>
              <div className="chat-box-bottom">
                <textarea
                  className="chat-message-input"
                  placeholder="Write something..."
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                />
                <Button
                  color="success"
                  variant="contained"
                  className="chat-submit-button"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <h1>Start a Chat.</h1>
          )}
        </div>
      </form>

      <div className="chat-online">
        <div className="chat-online-wrapper">
          <h4>Online Users</h4>
          <ChatOnline
            onlineUsers={onlineUsers}
            currentId={user._id}
            setCurrentChat={setCurrentChat}
          />
        </div>
      </div>
    </div>
  );
};
