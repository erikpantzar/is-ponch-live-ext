const CLIENT_ID = "0m9j15dbe8a715wjgeyq871rmoqe36";
const CLIENT_SECRET = "v6ktrd7pxxiavdo199zs8lcuhz2s97";
const endpoint = {
  oath: "https://id.twitch.tv/oauth2/token",
  streams:
    "https://api.twitch.tv/helix/streams?user_login=toastracktv&type=live",
  videos: "https://api.twitch.tv/helix/videos",
};
const PONCH_ID = "24808432";

// let this be
let bearer = "";
let sidebarElementTarget = null;

function isRunning() {
  if (window.location.href.indexOf("aftonbladet.se") > -1) {
    addPonch();
  }
}

function addPonch() {
  // add notice to the sidebar
  // main > sidebar
  const headings = document.getElementsByTagName("h2");
  try {
    for (let i = headings.length; i > 0; i--) {
      if (headings[i] !== undefined) {
        if (
          headings[i].textContent.toLowerCase().indexOf("bladet direkt") === 5
        ) {
          sidebarElementTarget = headings[i];
          attachPonchNotice();
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function attachPonchNotice() {
  // add a notice here!!]

  // do things
  // 1. get the token
  try {
    const response_token = await fetch(endpoint.oath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const tokens = await response_token.json();
    bearer = tokens.access_token;
  } catch (err) {
    console.error(err);
  }

  // 2. check if PONCHO is live

  try {
    const response_twitch_ponch = await fetch(endpoint.streams, {
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
    });

    // we get empty response data if he is not live!!
    const response_ponch_user = await response_twitch_ponch.json();
    const is_live = response_ponch_user.data.length > 0;
    const streamData = response_ponch_user.data[0];

    if (is_live) {
      addPonchTitleToAB(streamData);
    } else {
      addVideoToAB();
    }
  } catch (err) {
    console.error(err);
  }
  // 3. check if we can get other videos?
  // 4. links to discord?
  // 999. get money for this
}

function addPonchTitleToAB(data) {
  // add title and link from AB
  const elPre = document.querySelector("aside h2 + div div");
  const elClone = elPre.cloneNode(true);
  const link = elClone.querySelector("a");
  link.href = "https://twitch.tv/ponch";

  const hours = new Date().getHours();
  const modifiedHours = hours > 9 ? hours : `0${hours}`;

  elClone.querySelector("p").innerHTML =
    `${modifiedHours}.${new Date().getMinutes()} <strong><span style="color: #dd2a30;">${
      data.user_name
    } LIVE (${data.viewer_count})</span></strong>`.toLocaleUpperCase();

  elClone.querySelector("h3").textContent = data.title;

  elPre.insertAdjacentElement("beforebegin", elClone);
}

async function addVideoToAB() {
  // 24808432 po

  const addVodLink = (vod) => {
    console.log({ vod });
    //
    const entries = document.querySelector("main section").childNodes;
    const target = entries[2];

    const elClone = target.cloneNode(true);

    console.log({ elClone, target });

    // link
    elClone.querySelector("a").href = vod.url;

    // img
    // vod.thumbnail_url

    const vodImage = document.createElement("img");
    let newUrl = vod.thumbnail_url.replace("%{width}", 700);
    newUrl = newUrl.replace("%{height}", 320);
    vodImage.src = newUrl;
    elClone.querySelector("img").remove();
    elClone.querySelector("a").childNodes[0].remove();
    elClone.querySelector("h2").insertAdjacentElement("beforeBegin", vodImage);

    // title
    // vod.title
    elClone.querySelector("h2").textContent = `Ponch: ${vod.title}`;

    try {
      elClone.querySelector("p").textContent = vod.description;
    } catch (err) {
      console.error("no description or such", err);
    }
    const description = document.createElement("p");
    description.innerHTML = `<p>${vod.description}</p>`;
    elClone.querySelector("h2").appendChild(description);

    target.insertAdjacentElement("beforeBegin", elClone);
  };

  try {
    const res = await fetch(
      `${endpoint.videos}?user_id=${PONCH_ID}&type=archive&first=3`,
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Client-Id": CLIENT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    const resp = await res.json();
    console.log(resp);

    addVodLink(resp.data[0]);
  } catch (err) {
    console.error(err);
  }
}

isRunning();
