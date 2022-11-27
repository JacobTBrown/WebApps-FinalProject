export class CommunityPost {
    constructor(data) {
        if (data != null) {
            this.email = data.email;
            this.message = data.message;
            this.timestamp = data.timestamp;
        }
    }

    set_docId(id) {
        this.docId = id;
    }

    toFirestore() {
        return {
            email: this.email,
            message: this.message,
            timestamp: this.timestamp,
        }
    }
}