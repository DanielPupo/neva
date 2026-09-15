import React from 'react';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

/** Back view: boots, board edge, bent knees, jacket seams and helmet. */
export function Rider() {
  return (
    <Svg width="76" height="110" viewBox="0 0 76 110">
      <Defs>
        <LinearGradient id="jacket" x2="1" y2="1">
          <Stop stopColor="#f3a35e" />
          <Stop offset="1" stopColor="#b74930" />
        </LinearGradient>
      </Defs>
      <Path d="M8 94Q5 89 11 87L60 78Q69 77 70 84 71 89 62 91L18 101Q10 103 8 94Z" fill="#142e3d" />
      <Path d="M10 95Q27 93 62 85" stroke="#57a8ad" strokeWidth="3" fill="none" />
      <Path
        d="M25 62L24 77 29 87M48 62L51 75 45 84"
        stroke="#243e4d"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M26 77L32 82M50 75L44 79" stroke="#526674" strokeWidth="4" />
      <Path d="M24 87L33 86M41 85L49 83" stroke="#142733" strokeWidth="8" strokeLinecap="round" />
      <Path
        d="M23 34Q15 41 11 54L4 55M51 35L60 44 69 45"
        stroke="#b85b39"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M3 55L7 56M68 45L72 47" stroke="#223c48" strokeWidth="7" strokeLinecap="round" />
      <Path d="M23 29Q36 23 50 31L54 60Q39 72 21 62Z" fill="url(#jacket)" />
      <Path
        d="M26 36L29 59Q39 65 47 59L46 35"
        stroke="#faaf70"
        strokeWidth="2"
        fill="none"
        opacity=".7"
      />
      <Path d="M27 49L46 47M24 60Q38 67 52 59" stroke="#9f492f" strokeWidth="2" fill="none" />
      <Ellipse cx="37" cy="20" rx="13" ry="15" fill="#253f4e" />
      <Path
        d="M27 18Q27 5 39 7L45 10"
        stroke="#5d7885"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M25 23L48 22" stroke="#122b3a" strokeWidth="5" />
      <Path d="M25 29Q38 39 48 28" stroke="#233947" strokeWidth="5" fill="none" />
    </Svg>
  );
}
