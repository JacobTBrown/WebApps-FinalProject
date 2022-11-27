import * as Elements from './elements.js';
import * as Firestore from '../controller/firestore_controller.js';
import * as Util from './util.js';
import {routePath} from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_message.js';
import { DEV } from '../model/constants.js';
import { CommunityPost } from '../model/community_post.js';

export function addEventListeners() {
    Elements.menus.community.addEventListener('click', () => {
        history.pushState(null, null, routePath.COMMUNITY);
        community_page();
    });
}

let feedHistory;

export async function community_page() {
    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    let html;
    const response = await fetch('/viewpage/templates/community_page.html', {cache: 'no-store'});
    html = await response.text();

    Elements.root.innerHTML = html;

    try {
        feedHistory = await Firestore.getFeedHistory();

        tableBody = document.getElementById('tbody-feed');

        await buildFeed(feedHistory);
    } catch (e) {
        if (DEV) console.log(e);
        Util.info('Cannot get community feed history', JSON.stringify(e));
        return;
    }

    if (feedHistory.length == 0) {
        tableBody.innerHTML = 'No messages posted.';
    }

    addListeners();
}

let tableBody;


export function buildFeed(feedHistory) {
    for (let i = 0; i < feedHistory.length; i++) {
        let date = new Date(feedHistory[i].timestamp);
        date = date.toLocaleDateString() + " " + date.toLocaleTimeString();
   
        tableBody.innerHTML += `
        <tr id="post-entry-${i}">
            <td> 
                <div style="width: 100%">
                    <div style="background-color: darkgreen; color: white;">
                        By ${feedHistory[i].email} (Posted at ${date})<br>
                    </div>
                    <div id="message-${i}" style="background-color: dimgrey; color: white;">
                        ${feedHistory[i].message}
                    </div>
                    <textarea id="textarea-${i}" style="display: none; margin: 5px; width: 75%;" rows=4>${feedHistory[i].message}</textarea>
                    
                    <div id="edit-controls-${i}" style="display: none">
                        <button class="btn btn-outline-danger" id="button-update-${i}">Update</button>
                        <button class="btn btn-outline-secondary" id="button-cancel-${i}">Cancel</button>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: ${feedHistory[i].email != currentUser.email ? 'none' : 'block'};">
                    <button class="btn btn-outline-primary" id="button-edit-${i}">Edit</button><br>
                    <button class="btn btn-outline-danger" id="button-delete-${i}">Delete</button>
                </div>
            </td>
        </tr>
        `;
    }
}

export function addListeners() {
    const createMessage = document.getElementById('form-create-message');
    const createButton = document.getElementById('button-create');
    const cancelButton = document.getElementById('button-cancel');
    const textArea = document.getElementById('textarea-create');

    createButton.addEventListener('click',  () => {
        createButton.style.display = "none";
        createMessage.style.display = "block";
    });
    
    const saveButton = document.getElementById('button-save');
    saveButton.addEventListener('click', async () => {
        let history = new CommunityPost({email: currentUser.email, message: textArea.value, timestamp: Date.now()});

        try {
            await Firestore.addFeedHistory(history.toFirestore());
            Util.info('Post added!', 'Your post has been successfully added to the community feed.');
        } catch (e) {
            if (DEV) console.log(e);
            Util.info("Could not create post", JSON.stringify(e));
        }

        textArea.value = '';
        createButton.style.display = "block";
        createMessage.style.display = "none";

        try {
            feedHistory = await Firestore.getFeedHistory();
    
            tableBody = document.getElementById('tbody-feed');
            tableBody.innerHTML = '';
    
            await buildFeed(feedHistory);
        } catch (e) {
            if (DEV) console.log(e);
            Util.info('Cannot get community feed history', JSON.stringify(e));
            return;
        }
        addFeedListeners();
    });
    
    cancelButton.addEventListener('click', () => {
        textArea.value = '';
        createButton.style.display = "block";
        createMessage.style.display = "none";
    });

    addFeedListeners();
}

export function addFeedListeners() {
    let buttonsUpdate = [];
    let buttonsCancel = [];
    let buttonsEdit = [];
    let buttonsDelete = [];
    
    for (let i = 0; i < feedHistory.length; i++) {
        buttonsUpdate.push(document.getElementById(`button-update-${i}`));
        buttonsCancel.push(document.getElementById(`button-cancel-${i}`));
        buttonsEdit.push(document.getElementById(`button-edit-${i}`));
        buttonsDelete.push(document.getElementById(`button-delete-${i}`));

        buttonsUpdate[i].addEventListener('click', async () => {
            const textAreaDiv = document.getElementById(`textarea-${i}`);
            if (textAreaDiv.value != feedHistory[i].message) {
                const newText = textAreaDiv.value;
                feedHistory[i].message = newText;
                const messageDiv = document.getElementById(`message-${i}`);
                messageDiv.textContent = newText;
                feedHistory[i].timestamp = Date.now();
                
                try {
                    await Firestore.updateFeedHistory(feedHistory[i]);
                    Util.info('Post updated!', 'Your post has been successfully updated.');

                    feedHistory = await Firestore.getFeedHistory();
    
                    tableBody = document.getElementById('tbody-feed');
                    tableBody.innerHTML = '';
            
                    await buildFeed(feedHistory);
                } catch (e) {
                    if (DEV) console.log(e);
                    Util.info('Cannot update your post', JSON.stringify(e));
                    return;
                }
                addFeedListeners();
            }

            const editControls = document.getElementById(`edit-controls-${i}`);
            editControls.style.display = "none";

            const textArea = document.getElementById(`textarea-${i}`);
            textArea.style.display = 'none';

            const messageDiv = document.getElementById(`message-${i}`);
            messageDiv.style.display = 'block';
        });

        buttonsCancel[i].addEventListener('click', () => {
            const editControls = document.getElementById(`edit-controls-${i}`);
            editControls.style.display = "none";

            const textArea = document.getElementById(`textarea-${i}`);
            textArea.style.display = 'none';

            const messageDiv = document.getElementById(`message-${i}`);
            messageDiv.style.display = 'block';
        });

        buttonsEdit[i].addEventListener('click', () => {
            const editControls = document.getElementById(`edit-controls-${i}`);
            editControls.style.display = "block";

            const textArea = document.getElementById(`textarea-${i}`);
            textArea.style.display = 'block';

            const messageDiv = document.getElementById(`message-${i}`);
            messageDiv.style.display = 'none';
        });

        buttonsDelete[i].addEventListener('click', async () => {
            if (confirm("Press OK to confirm deletion.")) {
                const rowTag = document.getElementById(`post-entry-${i}`);
                rowTag.parentNode.removeChild(rowTag);
    
                try {
                    await Firestore.deleteFeedHistory(feedHistory[i]);
                    Util.info('Post deleted!', 'Your post has been successfully deleted from the database.');
                } catch (e) {
                    if (DEV) console.log(e);
                    Util.info('Cannot delete your post', JSON.stringify(e));
                    return;
                }
            }
        });
    }
}