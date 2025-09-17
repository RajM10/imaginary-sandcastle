# Imaginary Sandcastle

An interactive web experience featuring a mystical sandcastle that transforms between day and night cycles. Built with TypeScript and Vite, this project combines ambient music, sound effects, and interactive elements to create an immersive digital art piece.

## Features

- **Dynamic Day/Night Cycle**: Watch as the scene transitions between day and night phases
- **Interactive Elements**: Click on various objects in the scene to trigger events
- **Ambient Music**: Contextual background music that changes with the time cycle
- **Sound Effects**: Audio feedback for interactions
- **Puzzle Elements**: Discover hidden interactions and transformations
- **Responsive Design**: Optimized for different screen sizes

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd imaginary-sandcastle
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Interact

- **Music Toggle**: Use the music button to toggle background audio on/off
- **Pedestal**: Click on the pedestal to trigger transformations
- **Environmental Elements**: Various objects in the scene are interactive - experiment by clicking around
- **Day/Night Transitions**: The scene automatically cycles between day and night phases
- **Hidden Interactions**: Some elements may require multiple clicks or specific timing

## Project Structure

```
imaginary-sandcastle/
├── public/
│   ├── audio/          # Sound files and music
│   ├── img/            # Image assets
│   └── assets/         # Other static assets
├── src/
│   ├── helper/         # Component modules (Castle, Tree, etc.)
│   ├── main.ts         # Main application logic
│   └── *.css          # Styling files
├── index.html          # Entry HTML file
└── package.json        # Project configuration
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with responsive design
- **Web Audio API**: For music and sound effects

## Audio Credits

This project uses audio assets from [OpenGameArt.org](https://opengameart.org), a fantastic resource for free and open game assets. We gratefully acknowledge the following contributors:

### Music Tracks

- **Day Music** (`day.ogg`) - Ambient daytime soundtrack
- **Night Music** (`night.mp3`) - Atmospheric nighttime soundtrack
- **Resolution Music** (`neutral.ogg`) - Peaceful resolution theme

### Sound Effects

- **Chime Sound** (`chime.ogg`) - Magical interaction sound
- **Crack Sound** (`crack.wav`) - Transformation sound effect

_Note: Specific artist credits will be added as audio sources are identified. All audio assets are used in accordance with their respective Creative Commons licenses._

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. Please check individual asset licenses for specific usage rights, particularly for audio files sourced from OpenGameArt.org.

## Acknowledgments

- [OpenGameArt.org](https://opengameart.org) - For providing free, high-quality audio assets
- The open source community for tools and inspiration
- All contributors who help improve this project

## Support

If you encounter any issues or have questions, please open an issue on the project repository.

---

_Built with ❤️ and lots of digital sand_
