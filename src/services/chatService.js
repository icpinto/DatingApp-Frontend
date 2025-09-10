import axios from "axios";

const chatService = axios.create({
  baseURL: "http://localhost:8000",
});

export default chatService;
