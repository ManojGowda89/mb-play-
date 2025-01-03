import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from "@mui/material";
import axios from "axios";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebaseConfig"; // Firebase configuration

import Layout from "./Comp/Layout";
import { useStore } from "../Store";
export default function Home() {

  const {isAdmin}  =useStore()
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openVideoPopup, setOpenVideoPopup] = useState(false); // Separate state for video popup
  const [openUploadPopup, setOpenUploadPopup] = useState(false); // Separate state for upload popup
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [dateFilter, setDateFilter] = useState(""); // New state for the date filter
  const [currentPage, setCurrentPage] = useState(1); // To track the current page
  const videosPerPage = 9; // Number of videos to display per page

  useEffect(() => {
   
    fetchVideos();
  }, []);

 

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://mb-paly-server.onrender.com/videos",{
        withCredentials:true
      });
      if (response.data.videos) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setOpenUploadPopup(false);

    if (!videoFile || !thumbnailFile) {
      alert("Please select both video and thumbnail files.");
      return;
    }

    setLoading(true);

    // Upload video and thumbnail to Firebase Storage
    const videoStorageRef = ref(storage, `videos/${videoFile.name}`);
    const thumbnailStorageRef = ref(
      storage,
      `thumbnails/${thumbnailFile.name}`
    );

    try {
      // Upload video file
      await uploadBytes(videoStorageRef, videoFile);
      const videoUrl = await getDownloadURL(videoStorageRef);

      // Upload thumbnail file
      await uploadBytes(thumbnailStorageRef, thumbnailFile);
      const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);

      // Prepare video metadata
      const videoData = {
        videoName: videoFile.name,
        videoUrl: videoUrl, // This is the URL from Firebase Storage
        thumbnailUrl: thumbnailUrl, // This is the thumbnail URL from Firebase Storage
        createdAt: new Date(),
      };

      // Save video data to your backend (e.g., MongoDB or your custom database)
      await axios.post("https://mb-paly-server.onrender.com/videos", videoData,{
        withCredentials:true
      });

      // Fetch updated video list
      fetchVideos();
      setLoading(false);
      setOpenUploadPopup(false); // Close the upload popup after successful upload
    } catch (error) {
      console.error("Error uploading files: ", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.videoName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

      const videoDate = new Date(video.createdAt).toISOString().split("T")[0];
    const matchesDate = dateFilter
      ? videoDate ===
       dateFilter
      : true;
    return matchesSearch && matchesDate;
  });

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setOpenVideoPopup(true); // Open the video popup
  };

  const handleCloseVideoPopup = () => {
    setOpenVideoPopup(false);
    setSelectedVideo(null);
  };

  const handleDeleteVideo = async (videoId, videoUrl, thumbnailUrl, e) => {
    e.stopPropagation(); // Prevent the card click from being triggered

    setLoading(true);
    try {
      // First, delete from Firebase Storage
      const videoRef = ref(storage, videoUrl);
      const thumbnailRef = ref(storage, thumbnailUrl);

      await deleteObject(videoRef);
      await deleteObject(thumbnailRef);

      // Then, delete from the server
      await axios.delete(`https://mb-paly-server.onrender.com/videos/${videoId}`,{
        withCredentials:true
      });

      // Fetch updated video list
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to show videos per page
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(
    indexOfFirstVideo,
    indexOfLastVideo
  );

  // Logic to load more videos
  const loadMoreVideos = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <Layout>
      <Container>
        {isAdmin ? <h1>Admin Video Gallery</h1> : <h1>Video Gallery</h1>}

        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenUploadPopup(true)}
          >
            Add New Video
          </Button>
        )}

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Videos"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
        />

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={handleDateChange}
          style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
        />

        {loading ? (
          <CircularProgress />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {currentVideos.length > 0 ? (
              currentVideos.map((video) => (
                <Card
                  key={video._id}
                  style={{ width: "250px", cursor: "pointer" }}
                  onClick={() => handleVideoClick(video)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.videoName}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <h3 style={{ textAlign: "center", padding: "10px" }}>
                    {video.videoName}
                  </h3>
                  {isAdmin && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={(e) =>
                        handleDeleteVideo(
                          video._id,
                          video.videoUrl,
                          video.thumbnailUrl,
                          e
                        )
                      }
                    >
                      Delete
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <p>No videos found</p>
            )}
          </div>
        )}

        {/* Load More Videos Button */}
        {filteredVideos.length > currentVideos.length && (
          <Button
            variant="contained"
            color="primary"
            onClick={loadMoreVideos}
            style={{ marginTop: "20px" }}
          >
            See More
          </Button>
        )}

        {/* Video Playback Popup */}
        <Dialog open={openVideoPopup} onClose={handleCloseVideoPopup} fullWidth>
          <DialogTitle>{selectedVideo?.videoName}</DialogTitle>
          <DialogContent>
            {selectedVideo ? (
              <video width="100%" controls>
                <source src={selectedVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <CircularProgress />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseVideoPopup} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Upload Popup */}
        <Dialog
          open={openUploadPopup}
          onClose={() => setOpenUploadPopup(false)}
        >
          <DialogTitle>Upload New Video</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              style={{ marginBottom: "10px" }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              style={{ marginBottom: "10px" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUploadPopup(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpload} color="primary">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}


