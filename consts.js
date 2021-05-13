require("dotenv").config();

StreamTapeAPI = {
  getDownloadTicket: (fileId) => {
    return (
      "https://api.streamtape.com/file/dlticket?file=" +
      fileId +
      "&login=" +
      process.env.STREAMTAPE_API_LOGIN +
      "&key=" +
      process.env.STREAMTAPE_API_KEY
    );
  },
  getDownloadLink: (fileId, ticket) => {
    return (
      "https://api.streamtape.com/file/dl?file=" + fileId + "&ticket=" + ticket
    );
  },
  getFileInfo: (fileId) => {
    return (
      "https://api.streamtape.com/file/info?file=" +
      fileId +
      "&login=" +
      process.env.STREAMTAPE_API_LOGIN +
      "&key=" +
      process.env.STREAMTAPE_API_KEY
    );
  },
};

YandexAPI = {
  getFileResource: (public_key) => {
    return (
      "https://cloud-api.yandex.net/v1/disk/public/resources?" + public_key
    );
  },
};

OpenDriveAPI = {
  getFileInfo: (fileId) => {
    return "https://dev.opendrive.com/api/v1/file/info.json/" + fileId;
  },
};

module.exports = { StreamTapeAPI, YandexAPI, OpenDriveAPI };
