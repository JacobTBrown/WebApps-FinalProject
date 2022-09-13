import { modalInfoBox } from './elements.js';

export function info(title, body, closeModal) {
    if (closeModal) closeModal.hide();
    modalInfoBox.title.innerHTML = title;
    modalInfoBox.body.innerHTML = body;
    modalInfoBox.modal.show();
}

export function disableButton(button) {
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = "Wait...";
    return label;
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label;
    button.disabled = false;
}