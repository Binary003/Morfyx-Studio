import axios from "axios";
import { env } from "./env";

export const shipmozoClient = axios.create({
  baseURL: "https://api.shipmozo.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.shipmozoApiKey}`
  },
  timeout: 20000
});
