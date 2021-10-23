require("dotenv").config();
const { IgApiClient } = require("instagram-private-api");
// const express = require("express");

// const app = express();
const ig = new IgApiClient();
const { USER, PASSWORD } = process.env;
// const PORT = 3000;

let loggedInUser = null;
let accountFollowers = null;
let accountFollowings = null;

app.use(express.json());

async function login() {
  try {
    loggedInUser = await ig.account.login(USER, PASSWORD);
    console.log("Logged user is:", loggedInUser);
  } catch (error) {
    console.log(error.message);
  }
}

async function getUserFollowers() {
  try {
    accountFollowers = await ig.feed.accountFollowers().items();
  } catch (error) {
    console.error(error.message);
  }
}

async function getUserFollowing() {
  try {
    accountFollowings = await ig.feed.accountFollowing().items();
  } catch (error) {
    console.error(error.message);
  }
}

function getFollowersUsername() {
  const followersUsername = new Set(
    accountFollowers.map(({ username }) => username)
  );
  return followersUsername;
}

function getNotFollowingYou(followersUsername) {
  return accountFollowings.filter(
    ({ username }) => !followersUsername.has(username)
  );
}

/**
 * Unfollow
 */
async function unfollow(notFollowingYou) {
  for (const user of notFollowingYou) {
    await ig.friendship.destroy(user.pk);
    console.log(`unfollowed ${user.username}`);
    /*
        Time, is the delay which is between 1 second and 7 seconds.
        Creating a promise to stop the loop to avoid api spam
     */
    const time = Math.round(Math.random() * 6000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, time));
  }
}

async function main() {
  ig.state.generateDevice(USER);
  await login();
  await getUserFollowers();
  await getUserFollowing();
  const followersUsername = getFollowersUsername();
  const notFollowingYou = getNotFollowingYou(followersUsername);
  console.log("Not following you:", notFollowingYou);

  // unfollow
  await unfollow(notFollowingYou);
}

main();
