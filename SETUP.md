# Smart Home Orchestrator - Setup Guide

A sophisticated smart home control system with natural language AI processing using Google Gemini API and ScaleDown API for token optimization.

## Features

- **AI Voice Control** - Natural language commands powered by Google Gemini
- **Token Optimization** - Optional ScaleDown API integration for cost reduction
- **6 Smart Rooms** - Living Room, Bedroom, Kitchen, Bathroom, Home Office, Outdoor
- **28+ Devices** - Lights, AC, TV, appliances, security systems, and more
- **Custom Scenes** - Save and apply device configurations instantly
- **Activity Logging** - Track all device changes and AI commands
- **Voice Input** - Speech-to-text for hands-free control
- **Real-time Updates** - Persistent storage with Supabase
- **Responsive Design** - Beautiful UI that works on all devices

## Prerequisites

1. **Gemini API Key** (Required)
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or sign in to your Google account
   - Click "Create API Key"
   - Copy your API key

2. **ScaleDown API Key** (Optional - for token optimization)
   - Sign up at ScaleDown's website
   - Obtain your API key from the dashboard

## Setup Instructions

### Step 1: Configure API Keys

1. Open the application in your browser
2. Click the **Settings** icon (gear icon) in the top-right corner
3. Enter your **Gemini API Key** in the first field
4. (Optional) Enter your **ScaleDown API Key** for token compression
5. (Optional) Enable **Prompt Compression** toggle if you added a ScaleDown key
6. Click **Save Settings**

### Step 2: Start Using the App

The demo data is automatically initialized with:
- 6 rooms with different themes
- 28 smart devices across all rooms
- 4 pre-configured scenes
- All devices start in "off" state

## Example Commands

Try these natural language commands in the command bar:

### Basic Device Control
- "Turn on the living room lights"
- "Turn off all lights in the bedroom"
- "Set the bedroom AC to 22 degrees"
- "Dim the kitchen lights"
- "Turn on the coffee maker"
- "Open the bedroom curtains"
- "Close the outdoor gate"

### Smart Adjustments
- "Make it cooler" (lowers AC temperature by 2-3°C)
- "Make it warmer" (increases AC temperature)
- "I'm cold" (adjusts temperature accordingly)
- "Brighten the lights" (increases brightness)
- "It's too dark" (turns on lights)

### Scenes & Routines
- "Movie mode" (dims lights, closes blinds, turns on TV)
- "Good morning" (opens curtains, turns on lights, starts coffee)
- "Goodnight" (turns off lights, closes curtains, enables security)
- "I'm working" (turns on office lights and PC)
- "Party mode" (bright lights, entertainment systems on)

### Multi-Device Commands
- "Turn off everything in the living room"
- "Set all bedroom lights to 50%"
- "Turn on all outdoor lights"
- "Prepare the kitchen for cooking" (lights + appliances)

### Questions
- "What's the temperature in the living room?"
- "Are the outdoor cameras on?"
- "Which lights are currently on?"

## Voice Input

1. Click the **microphone icon** in the command bar
2. Allow microphone access when prompted
3. Speak your command clearly
4. The command will auto-populate when you finish speaking
5. Click Send or press Enter to execute

## Creating Custom Scenes

1. Set up your devices exactly how you want them
2. Open the **Scenes** panel in the sidebar
3. Click the **+** button
4. Enter a name for your scene (e.g., "Reading Mode")
5. Click **Save Current State**
6. Your scene is now ready to use anytime!

## Understanding the Interface

### Header
- **Home icon** - Shows active devices and room count
- **Security Mode** - Click to cycle: Disarmed → Armed → Away
- **Settings** - Configure API keys and preferences

### Room Cards
- Each card shows all devices in that room
- Toggle switches control on/off state
- Sliders adjust brightness, temperature, speed, etc.
- Color-coded by room theme

### Command Bar (Bottom)
- Quick action buttons for common commands
- Text input for natural language commands
- Microphone button for voice input
- Token savings counter (when compression enabled)

### Sidebar
- **Scenes** - Quick access to saved configurations
- **Activity Log** - Real-time history of all actions

## Token Optimization

When ScaleDown API is configured and compression is enabled:

- System prompts are compressed before sending to Gemini
- Reduces token usage by 30-50% on average
- Token savings are tracked and displayed
- Session totals show cumulative savings
- Compression is transparent and automatic

## Troubleshooting

### "Please configure your Gemini API key"
- Open Settings and add your Gemini API key
- Make sure the key is valid and active
- Check that you saved the settings

### Voice Input Not Working
- Ensure you're using Chrome, Edge, or Safari
- Grant microphone permissions when prompted
- Check browser microphone settings
- Voice recognition requires an internet connection

### AI Not Understanding Commands
- Be specific about room and device names
- Use natural language (avoid technical jargon)
- Try rephrasing the command
- Check that devices exist in the specified room

### Devices Not Updating
- Check your internet connection
- Refresh the page to sync latest state
- View Activity Log to see if command was processed

## Technical Details

### Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini Pro API
- **Optimization**: ScaleDown API (optional)

### Data Persistence
- All device states saved to Supabase
- Activity logs stored for 50 most recent actions
- Settings synced across sessions
- Scenes stored with full device configurations

### Security
- API keys stored securely in Supabase
- Row Level Security enabled on all tables
- Public demo mode for single-user setup
- No sensitive data exposed to client

## Performance Tips

- Use quick action buttons for common commands
- Create scenes for frequently-used configurations
- Enable compression to reduce API costs
- Voice input is faster than typing for long commands

## Support

For issues or questions:
- Check the Activity Log for error messages
- Review the console for technical details
- Verify API keys are correctly configured
- Ensure internet connection is stable

---

Built with modern web technologies for a seamless smart home experience.
