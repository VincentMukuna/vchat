# VChat

This is a simple and feature-rich chat application built with React, Appwrite, Chakra UI and other modern technologies. The app allows users to engage in real-time messaging, create and manage group chats, update their profiles, and more.

## Preview

https://github.com/VincentMukuna/vchat/assets/93912489/01db2529-a858-41ab-9d2f-7173e2c895e4

## Screenshots
![Screenshot 2023-11-14 001613](https://github.com/VincentMukuna/vchat/assets/93912489/b51d39b8-86fb-463b-8e12-02b218279eda)



![Screenshot 2023-11-14 001742](https://github.com/VincentMukuna/vchat/assets/93912489/d695955f-6910-425e-a1d2-af8418afcd64)

## Features

- **Real-Time Messaging:** Instant messaging with support for text, images, and voice messages.
- **Group Chats:** Create and manage group conversations with multiple participants.
- **User Authentication:** Secure registration and login functionality for user accounts (OAuth and Email)
- **Profile Customization:** Personalize your profile with avatars, and more.
- **Multimedia Sharing:** Share files, documents, and locations within the chat.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

## Appwrite Setup

1. Open the [Appwrite Console](https://cloud.appwrite.io/) and make a new project.
2. Add a new web app platform, typing
   in your local IP address (or `localhost`).
3. Click on "Databases" and make a new database
4. Ensure your schema matches this
5. Click on "Storage" and create the following buckets

## Running VChat

1. Clone the repository:

   ```bash
   git clone https://github.com/VincentMukuna/vchat.git

   ```

2. Change to the project directory:
   ```bash
   cd chat-app
   ```
3. Change to the project directory:
   ```bash
   npm install
   ```
4. Edit `config.js` to include the relevant project's API endpoint and ID storage and collection IDs
5. Start the development server:
   ```bash
      npm run dev
   ```

### License

This project is licensed under the MIT License.

### Contact

For any questions or feedback, feel free to reach out at mukunavincent28@gmail.com.
