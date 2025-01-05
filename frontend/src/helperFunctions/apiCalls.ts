import axios from "axios";

export const getItems = async function () {
  const response = await axios.get(
    "http://localhost:3001/api/v1/item/allitems"
  );
  return response;
};
export const loggedIn = async function (jwt: string | null) {
  const {
    data: { status },
  } = await axios.post("http://localhost:3001/api/v1/user/loggedIn", {
    jwtR: jwt,
  });
  return status;
};
export const userProfile = async function (userId: string | null) {
  const response = await axios.post(
    "http://localhost:3001/api/v1/user/userprofile",
    { userId }
  );
  return response;
};
export const updateProfilePicture = async function (formData: object) {
  const response = await axios.post(
    "http://localhost:3001/api/v1/user/updateProfilePicture",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const fetchSearch = async function (
  searchQuery: string,
  category: string
) {
  const response = await axios.get(
    `http://localhost:3001/api/v1/item/allitems/?search=${searchQuery}&&category=${category}`
  );
  return response;
};
export const fetchNotifications = async function (userId: string | null) {
  const response = await axios.get(
    `http://localhost:3001/api/v1/notification/${userId}`
  );
  return response;
};
export const getUserInfo = async function (userId: string) {
  const { data } = await axios.post(
    "http://localhost:3001/api/v1/user/getuserinfo",
    { userId }
  );
  return data;
};
export const updateNotifications = async function (userId: string | null) {
  await axios.put(
    "http://localhost:3001/api/v1/notification/clearnotifications",
    {
      userId,
    }
  );
};
export const addItems = async function (formDataToSend, token: string | null) {
  const response = await axios.post(
    "http://localhost:3001/api/v1/item/additem",
    formDataToSend,
    {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data", // Set automatically by Axios
      },
    }
  );
  return response;
};
export const itemDetails = async function (id: string | undefined) {
  const {
    data: { item },
  } = await axios.get(`http://localhost:3001/api/v1/item/${id}`);
  return item;
};
export const HighestBidderInfo = async function (id: string | undefined) {
  const {
    data: { HighestBidder, HighestPrice, secondHighestBid },
  } = await axios.get(`http://localhost:3001/api/v1/bid/highest-bidder/${id}`);
  return { HighestBidder, HighestPrice, secondHighestBid };
};
export const addBid = async function (
  numericBid: number,
  userId: string,
  id: string | undefined
) {
  await axios.post(`http://localhost:3001/api/v1/bid/add-bid`, {
    bidAmount: numericBid,
    userId,
    auctionId: Number(id),
  });
};
export const newNotification = async function (
  secondHighestBid: string,
  id: string | undefined
) {
  await axios.post(
    `http://localhost:3001/api/v1/notification/new-notification`,
    { userId: secondHighestBid, auctionId: Number(id) }
  );
};
export const signup = async function (formData) {
  const { data } = await axios.post(
    "http://localhost:3001/api/v1/user/signup",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};
export const signin = async function (formData) {
  const { data } = await axios.post("http://localhost:3001/api/v1/user/login", {
    email: formData.email,
    password: formData.password,
  });
  return data;
};
