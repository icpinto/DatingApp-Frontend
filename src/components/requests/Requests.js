import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Grid, Box, CircularProgress } from "@mui/material";
import api from "../../services/api";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/requests", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setRequests(response.data.requests); 
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch requests");
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Handle accept request
  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/user/acceptRequest`,
      { id: parseInt(id, 10) },
      {
        headers: {
          Authorization: `${token}`,
        },
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (err) {
      alert("Failed to accept the request. Please try again.");
    }
  };

  // Handle reject request
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/user/rejectRequest`,
      { id: parseInt(id, 10) },
      {
        headers: {
          Authorization: `${token}`,
        },
      });
      setRequests(requests.filter((request) => request.id !== id));
    } catch (err) {
      alert("Failed to reject the request. Please try again.");
    }
  };

  if (loading) return <CircularProgress />; 
  if (error) return <Typography color="error">{error}</Typography>; 

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Received Requests
      </Typography>

      {(!requests || requests.length === 0)  ? (
        <Typography variant="body1" color="text.secondary">
          No requests found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <CardContent>
                  <Typography variant="h6">{request.sender_id}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ marginY: 1 }}>
                    {request.description}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Requests;
