import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function Environment() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 850" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="sky" x2="0" y2="1">
          <Stop stopColor="#758d9d" />
          <Stop offset="1" stopColor="#dae5e8" />
        </LinearGradient>
        <LinearGradient id="snow" x2=".6" y2="1">
          <Stop stopColor="#d2dfe5" />
          <Stop offset=".4" stopColor="#edf3f6" />
          <Stop offset="1" stopColor="#ffffff" />
        </LinearGradient>
        <LinearGradient id="ridge" x2="1" y2="1">
          <Stop stopColor="#f4f7f6" />
          <Stop offset="1" stopColor="#9bafbd" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="850" fill="url(#sky)" />
      <Circle cx="306" cy="94" r="48" fill="#f9ebcf" opacity=".09" />
      <Circle cx="306" cy="94" r="27" fill="#fff4d8" opacity=".85" />
      <Path d="M-80 254L42 83 93 131 147 53 257 238 305 136 440 266Z" fill="#9aabb8" />
      <Path
        d="M42 83L3 151 35 138 57 157 70 134ZM147 53L90 143 117 130 144 161 166 131 194 143Z"
        fill="#e4ecee"
      />
      <Path d="M147 53L141 121 169 154 178 130 211 172Z" fill="#b8c9d3" />
      <Path d="M-44 328L68 156 141 259 238 120 425 349Z" fill="url(#ridge)" />
      <Path
        d="M68 156L65 221 90 258 75 247 115 313 144 294ZM238 120L216 207 240 238 226 247 277 308 281 264 333 288Z"
        fill="#91a7b9"
        opacity=".72"
      />
      <Path d="M238 120L186 211 215 198 216 207ZM68 156L37 207 63 200 65 220Z" fill="#fff" />
      <Path d="M0 248Q97 202 200 218Q311 212 400 261V850H0Z" fill="url(#snow)" />
      <Path d="M184 220Q132 323 36 464L-180 850H0L177 342 195 220Z" fill="#a9c1d0" opacity=".3" />
      <Path d="M213 219Q275 382 405 520L493 850H400L222 347Z" fill="#c8d9e3" opacity=".6" />
      <Path d="M195 220L10 850M205 220L390 850" stroke="#c6d5de" strokeWidth="1.5" opacity=".7" />
      <G opacity=".38" fill="#7d98a7">
        <Path d="M9 280L18 244 28 280ZM25 264L32 238 41 264ZM373 274L382 238 394 274ZM360 250L366 228 374 250Z" />
      </G>
      <Path d="M0 216Q200 190 400 216V263Q200 229 0 267Z" fill="#e0e9ed" opacity=".2" />
    </Svg>
  );
}
