import "dotenv/config";   // first: the library reads CLOUDINARY_URL the moment it loads, and server.js loads .env later
import { v2 as cloudinary } from "cloudinary";

// 🖼️ Pictures admins add (memes for now), kept in our own Cloudinary account so a link on someone else's
// site can't break mid-game. Needs CLOUDINARY_URL in the server's environment (.env locally, Render live);
// without it, pasted links are saved as they are and the upload button says it isn't set up.
//
// Uploads go straight from the admin's browser to Cloudinary, with a signature from this server. The
// signature locks the limits below, so a signed-in admin can't change them from the browser.
const LIMITS = {
    folder: 'game-temple/memes',
    allowed_formats: 'jpg,png,webp,gif',
};
// Big photos are shrunk to fit a TV. The same limit, written the way each route needs it:
const SHRINK_SIGNED = 'c_limit,h_1600,w_1600';
const SHRINK_COPY = [{ crop: 'limit', width: 1600, height: 1600 }];

export const canStorePictures = () => !!process.env.CLOUDINARY_URL;

/** What the browser sends along with its file */
export const signUpload = () => {
    const { cloud_name: cloudName, api_key: apiKey, api_secret: secret } = cloudinary.config();
    const timestamp = Math.round(Date.now() / 1000);
    const fields = { ...LIMITS, transformation: SHRINK_SIGNED, timestamp };
    return { cloudName, apiKey, fields: { ...fields, signature: cloudinary.utils.api_sign_request(fields, secret) } };
};

const isStored = (url) => url.startsWith(`https://res.cloudinary.com/${cloudinary.config().cloud_name}/`);

/** A pasted link -> our own copy of the picture. Throws if Cloudinary can't read it as a picture. */
export const keepPicture = async (url) => {
    if (!canStorePictures() || isStored(url)) return url;
    const { secure_url: stored } = await cloudinary.uploader.upload(url, { ...LIMITS, transformation: SHRINK_COPY });
    return stored;
};
