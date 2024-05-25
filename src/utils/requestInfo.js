const getReqIpAddressByReq = (req) => {
  try {
    const headersIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const splitIP = headersIP.split(":");
    const ip = splitIP[splitIP.length - 1] || "Unknown IP";
    return ip;
  } catch (error) {
    return "Unknown IP";
  }
};

const getOSByReq = (req) => {
  try {
    const userAgent = req.headers["user-agent"];
    const osRegex = {
      windows: /Windows NT ([^\)]+)/,
      mac: /Macintosh/,
      linux: /Linux/,
      android: /Android/,
      ios: /(?:iPad|iPhone|iPod).* like Mac OS X/,
    };

    for (const os in osRegex) {
      if (osRegex[os].test(userAgent)) {
        return os;
      }
    }

    return "Unknown OS";
  } catch (error) {
    return "Unknown OS";
  }
};

export { getOSByReq, getReqIpAddressByReq };
