# 🦵 Don't Skip Leg Day Alarm 🦵

A humorous, frontend-only web application designed to comically prevent gym-goers from skipping leg day workouts. This app uses a combination of browser notifications, webcam verification, and funny punishments to keep you accountable for leg day!

## 🎯 Features

### Weekly Alarm Notification
- Set a weekly recurring alarm for your leg day
- Browser notifications alert you when it's time
- Persistent alerts that repeat until you take action

### "Quad Verification" System
- Upload a photo via webcam or from your device
- Our "sophisticated" AI (actually just random) verifies if you've been skipping leg day
- Get instant success or failure results with humorous messages

### Punishment Mode
- When verification fails, Barbie Girl by Aqua plays on loop
- Complete 100 squats to silence the music
- Basic motion detection counts your squats using your webcam
- Cheat detection system with snarky comments

### Chicken-Leg Mocking Memes
- View hilarious memes mocking chicken legs when you fail verification
- Get motivation to never skip leg day again!

## 📋 Prerequisites

- Node.js and npm installed
- Modern web browser with webcam access and notification permissions

## 🚀 Installation & Setup

1. Clone the repository
```
git clone [repository-url]
cd dont-skip-leg-day
```

2. Install dependencies
```
npm install
```

3. Add the "Barbie Girl" audio file
   - Due to copyright restrictions, you'll need to obtain this audio file yourself
   - Save it as `barbie-girl.mp3` in the `src/assets/audio/` directory

4. Start the development server
```
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 How to Use

1. **Set Up Your Alarm**
   - Choose the day of the week and time for your leg day workout
   - Click "Set Alarm" to activate

2. **Verification Process**
   - When the alarm triggers, you'll get a browser notification
   - Click on the notification to start verification
   - Use your webcam to take a photo or upload an image
   - Click "Verify Leg Day" to start the verification process

3. **Success or Punishment**
   - If you pass (random 40% chance): Celebration message and alarm resets for next week
   - If you fail (random 60% chance): Chicken leg memes and punishment mode

4. **Punishment Mode**
   - Complete 100 squats detected by your webcam
   - No cheating! The app will call you out if it thinks you're trying to skip squats
   - After 100 squats, you're free until next week!

## 🛠️ Tech Stack

- React.js (Create React App)
- Tailwind CSS for styling
- React-Webcam for camera access
- Howler.js for audio playback
- Local Storage API for data persistence
- Browser Notifications API

## 📱 Deployment

This app is designed to be deployed easily on Netlify, Vercel, or GitHub Pages:

```
npm run build
```

Then deploy the contents of the `build` directory to your hosting provider of choice.

## 😂 Humor Disclaimer

This app is meant to be funny and lighthearted! The "verification" system is completely random and doesn't actually analyze your legs. The squat counter uses very basic motion detection that might not be accurate. It's all in good fun!

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Gym bros everywhere who never skip leg day
- All the chicken legs that inspired this app
- Aqua for the "motivational" punishment music

---

Built with 💪 and lots of humor. Never skip leg day again!
