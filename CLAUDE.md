# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrueNAS Mobile App - A React Native mobile application for performing operations on TrueNAS Scale via its API. Built with Expo SDK 54, React 19, and TypeScript.

## Development Commands

```bash
npm start              # Start Expo dev server (press i for iOS, a for Android, w for Web)
npm run ios            # Start directly on iOS simulator
npm run android        # Start directly on Android emulator
npm run web            # Start in web browser
npm run lint           # Run ESLint
```

## Architecture

### Routing (Expo Router v6)
File-based routing where file structure defines navigation:
- `app/_layout.tsx` - Root layout, wrap with providers here
- `app/(tabs)/` - Tab navigation group (parentheses create route groups)
- `app/(tabs)/_layout.tsx` - Tab bar configuration
- `app/modal.tsx` - Modal screens use `presentation: 'modal'`

### Theme System
- `constants/theme.ts` - Color definitions for light/dark modes
- `hooks/use-color-scheme.ts` - Detects system theme (has `.web.ts` variant)
- `hooks/use-theme-color.ts` - Returns colors based on current theme
- Wrap root layout with `ThemeProvider` from `@react-navigation/native`

### Platform-Specific Code
Use file extensions for platform variants:
- `component.tsx` - Default/Android implementation
- `component.ios.tsx` - iOS-specific implementation
- `component.web.ts` - Web-specific implementation

### Path Aliases
TypeScript configured with `@/*` alias pointing to project root:
```typescript
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

### Reference Implementation
`app-example/` contains the original Expo template with examples of:
- Tab navigation setup
- Themed components (ThemedText, ThemedView)
- Parallax scroll views with react-native-reanimated
- Haptic feedback tabs (iOS)
- SF Symbols to Material Icons mapping

## Key Dependencies

- **expo-router** - File-based navigation
- **react-native-reanimated** - Smooth animations
- **expo-haptics** - Haptic feedback (iOS)
- **@expo/vector-icons** - Icon library
- **expo-image** - Optimized image component

## Design Reference

`screenshots/` contains TrueNAS Scale UI screenshots to use as visual reference when building screens. Review these when designing new UI to match the TrueNAS aesthetic: dark navy backgrounds, electric cyan (`#0099FF`) accent, subtle card borders, and high-contrast text.

## API Reference

`referencedocs/` contains the TrueNAS Scale 24.10.2.3 API reference documentation. Consult these when implementing API calls to understand available endpoints, request/response shapes, and authentication requirements.

## Version-Based API Services

The app supports multiple TrueNAS Scale versions. Currently supported: **24.10.2.3**

### Architecture Pattern
When implementing features that use the TrueNAS API:

1. **Start version-agnostic**: Put initial implementation in a shared service (e.g., `services/api/system.ts`)
2. **Version-specific when needed**: If a future version requires different API handling, create version-specific implementations:
   - `services/api/v24.10/system.ts` - Version-specific code
   - `services/api/system.ts` - Shared/common code or version router
3. **Server version is stored**: Each saved server has a `version` field that should be used to determine which API service implementation to call

This pattern allows us to support new TrueNAS versions without breaking compatibility with older ones. The version selection happens at server add time and is passed to the home screen and beyond.

## Configuration Notes

- New Architecture (Fabric) is enabled
- TypeScript strict mode is enabled
- Typed routes experimental feature is enabled
- React Compiler experimental feature is enabled
