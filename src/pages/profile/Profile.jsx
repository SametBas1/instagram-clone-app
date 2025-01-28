import { useContext, useEffect, useState } from "react";
import { Avatar, Button } from "@mui/material";
import {
  SettingsOutlined,
  LogoutOutlined,
  GridOnOutlined,
  VideoLibraryOutlined,
  BookmarkAddOutlined,
  AccountBoxOutlined,
  MailOutline,
  Favorite,
} from "@mui/icons-material";
import { Post } from "../../components/post/Post";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";

export const Profile = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(false);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const { username } = useParams();

  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const navigate = useNavigate();

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`/users?username=${username}`);
        setUser(res.data);
      } catch (error) {
        console.error("Kullanıcı alınamadı:", error);
      }
    };
    getUser();
  }, [username]);

  // Takip durumu kontrolü
  useEffect(() => {
    if (currentUser?.followings && user?._id) {
      setFollowed(currentUser.followings.includes(user._id));
    }
  }, [currentUser, user]);

  // Kullanıcının gönderilerini al
  useEffect(() => {
    const getPosts = async () => {
      try {
        const res = await axios.get(`/posts/profile/${username}`);
        setPosts(res.data);
      } catch (error) {
        console.error("Gönderiler alınamadı:", error);
      }
    };
    getPosts();
  }, [username]);

  const handleFollowClick = async () => {
    try {
      if (followed) {
        await axios.put(`/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "FOLLOW", payload: user._id });
      }
      setFollowed(!followed);
    } catch (error) {
      console.error("Takip işlemi başarısız:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      dispatch({ type: "LOGOUT" });
    }
  };

  const startConversation = async () => {
    try {
      await axios.post("/conversations", {
        senderId: currentUser._id,
        receiverId: user._id,
      });
      navigate("/messenger");
    } catch (error) {
      console.error("Mesaj başlatılamadı:", error);
    }
  };

  return (
    <div className="container">
      <div className="profile-page">
        <div className="profile-head">
          <div className="head-left">
            <Avatar
              src={user.profilePicture ? `${PF}${user.profilePicture}` : ""}
              sx={{ width: 150, height: 150 }}
            />
          </div>
          <div className="head-right">
            <div className="head-right-top">
              <span className="profile-page-username">{user.username}</span>
              <div className="profile-page-buttons">
                {user._id !== currentUser._id ? (
                  <Button
                    variant="contained"
                    size="small"
                    color={followed ? "error" : "success"}
                    onClick={handleFollowClick}
                  >
                    {followed ? "Takipten Çıkar" : "Takip Et"}
                  </Button>
                ) : (
                  <Button variant="contained" size="small">
                    Düzenle
                  </Button>
                )}
                {user._id === currentUser._id ? (
                  <button>
                    <SettingsOutlined />
                  </button>
                ) : (
                  <button onClick={startConversation}>
                    <MailOutline />
                  </button>
                )}
                {user._id === currentUser._id && (
                  <button onClick={handleLogout}>
                    <LogoutOutlined color="error" />
                  </button>
                )}
              </div>
            </div>
            <div className="head-right-center">
              <div className="post-count">
                <b>{posts.length}</b>
                <span>Gönderiler</span>
              </div>
              <div className="follower-count">
                <b>{user.followers?.length || 0}</b>
                <span>Takipçiler</span>
              </div>
              <div className="following-count">
                <b>{user.followings?.length || 0}</b>
                <span>Takip Edilenler</span>
              </div>
            </div>
            <div className="head-right-bottom">
              <b>{user.fullName}</b>
              <span>{user.bio || ""}</span>
            </div>
          </div>
        </div>
        <div className="profile-body">
          <div className="profile-nav-tabs">
            <button className="active">
              <GridOnOutlined />
              <span>Gönderiler</span>
            </button>
            <button>
              <VideoLibraryOutlined />
              <span>Videolar</span>
            </button>
            <button>
              <BookmarkAddOutlined />
              <span>Kaydedilenler</span>
            </button>
            <button>
              <AccountBoxOutlined />
              <span>Etiketlenenler</span>
            </button>
          </div>
          <div className="profile-post-grid">
            {posts.map((post) => (
              <div className="grid-post" key={post._id}>
                <Post post={post} />
                <div className="like-icon-wrapper">
                  <Favorite className="like-icon" />
                  <b>{post.likes?.length || 0}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
