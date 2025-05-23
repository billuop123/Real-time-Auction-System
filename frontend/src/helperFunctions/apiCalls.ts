import axios from "axios";

export const getItems = async function () {

  const response = await axios.get(
    "http://localhost:3001/api/v1/item/allItems",
    {
      headers: {
        Authorization: sessionStorage.getItem("jwt"),
      },
    }
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
    { userId },{
      headers:{
        Authorization: sessionStorage.getItem("jwt"),
      }
    }
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
    `http://localhost:3001/api/v1/item/allItems/?search=${searchQuery}&&category=${category}`
  );
  return response;
};
export const fetchNotifications = async function (userId: string | null) {
  const response = await axios.get(
    `http://localhost:3001/api/v1/notification/${userId}`,{
      headers:{
        Authorization: sessionStorage.getItem("jwt"),
      }
    }
  );
  return response;
};
export const getUserInfo = async function (userId: string) {
  const { data } = await axios.post(
    "http://localhost:3001/api/v1/user/getuserinfo",
    { userId },{
      headers:{
        Authorization: sessionStorage.getItem("jwt"),
      }
    }
  );
  return data;
};
export const updateNotifications = async function (userId: string | null) {
  await axios.put(
    "http://localhost:3001/api/v1/notification/clearnotifications",
    {
      userId,
    },{
      headers:{
        Authorization: sessionStorage.getItem("jwt"),
      }
    }
  );
};
export const addItems = async function (formDataToSend:any, token: string | null) {
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
  } = await axios.get(`http://localhost:3001/api/v1/item/${id}`,{
    headers:{
      Authorization: sessionStorage.getItem("jwt"),
    }
  });
  return item;
};
export const HighestBidderInfo = async function (id: string | undefined) {
  const {
    data: { HighestBidder, HighestPrice, secondHighestBid },
  } = await axios.get(`http://localhost:3001/api/v1/bid/highest-bidder/${id}`,{
    headers:{
      Authorization: sessionStorage.getItem("jwt"),
    }
  });
  return { HighestBidder, HighestPrice, secondHighestBid };
};
export const addBid = async function (
  numericBid: number,
  userId: string,
  id: string | undefined
) {
  const response = await axios.post(`http://localhost:3001/api/v1/bid/addBid`, {
    bidAmount: numericBid,
    userId,
    auctionId: Number(id),
  },{
    headers:{
      Authorization: sessionStorage.getItem("jwt"),
    }
  });
  return response.data;
};
export const newNotification = async function (
  secondHighestBid: string,
  id: String | undefined
) {
 
  await axios.post(
    `http://localhost:3001/api/v1/notification/new-notification`,
    { userId: secondHighestBid, auctionId: Number(id) },
    {
      headers:{
        Authorization: sessionStorage.getItem("jwt"),
      }
    }
  );
};
export const signup = async function (formData:any) {
  const { data } = await axios.post(
    "http://localhost:3001/api/v1/user/signup",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};
export const signin = async function (formData:any) {
  const { data } = await axios.post("http://localhost:3001/api/v1/user/login", {
    email: formData.email,
    password: formData.password,
  });
  return data;
};
export const resubmitItem = async function (itemId: string | undefined) {
  const response = await axios.post(
    `http://localhost:3001/api/v1/admin/items/${itemId}/resubmit`,
    {},
    {
      headers: {
        Authorization: sessionStorage.getItem("jwt")
      }
    }
  );
  return response;
};
