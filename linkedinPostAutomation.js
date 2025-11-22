/**
 * Script to automate posting on LinkedIn using LinkedIn API
 * 
 * Before running this script:
 * - Create a LinkedIn Developer app and obtain Client ID and Client Secret
 * - Configure OAuth 2.0 authorization code flow to get Access Token with w_member_social permission
 * - Replace ACCESS_TOKEN constant below with your valid access token
 * 
 * This script posts the content of LINKEDIN_POST_DRAFT.txt as a post on your LinkedIn profile.
 */

const fs = require('fs');
const axios = require('axios');
const path = require('path');

const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with your OAuth access token
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2/ugcPosts';

// Read the LinkedIn post draft content
const postContentFile = path.join(__dirname, 'LINKEDIN_POST_DRAFT.txt');
const postContent = fs.readFileSync(postContentFile, 'utf8');

// LinkedIn requires URN of your user profile to post on your behalf
// For demo, you need to get your member URN from LinkedIn API or profile
const MEMBER_URN = 'urn:li:person:YOUR_MEMBER_ID'; // Replace with your LinkedIn member URN

async function postToLinkedIn() {
    try {
        const postData = {
            "author": MEMBER_URN,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": postContent
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const response = await axios.post(LINKEDIN_API_URL, postData, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            }
        });

        console.log('Post successful, post URN:', response.data);
    } catch (error) {
        console.error('Error posting to LinkedIn:', error.response ? error.response.data : error.message);
    }
}

postToLinkedIn();
