import React, { useId } from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import type { ObstacleKind } from '../../types/game';
export const ART_WIDTH = 100;
export const ART_HEIGHT = 152;
export const ART_BASE = 140;

export function ObstacleArt({ kind }: { kind: ObstacleKind }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={ART_WIDTH} height={ART_HEIGHT} viewBox="0 0 100 152">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2=".5">
          <Stop stopColor={kind === 'tree' ? '#406559' : '#9aabb5'} />
          <Stop offset="1" stopColor={kind === 'tree' ? '#163e37' : '#586c7d'} />
        </LinearGradient>
      </Defs>
      <Ellipse cx="60" cy="141" rx="37" ry="7" fill="#7591a4" opacity=".24" />
      {kind === 'tree' ? (
        <>
          <Path d="M45 113L44 139Q50 144 55 138L53 110Z" fill="#695c51" />
          <Path
            d="M49 7L40 32 44 30 30 54 36 51 19 80 27 77 7 110 24 105 17 122Q46 131 83 121L76 104 94 110 75 78 81 81 64 51 70 54 56 30 60 32Z"
            fill={`url(#${id})`}
          />
          <Path
            d="M49 7L39 35 46 31 42 44 57 37ZM33 52L24 71 42 66 48 61 59 66 73 73 63 53 53 56 48 47 42 56ZM22 81L10 106 27 101 37 105 49 93 61 101 75 100 90 107 76 83 64 86 51 75 39 88ZM24 108L19 121 35 123 49 115 66 124 80 120 74 108 61 113 47 104 37 114Z"
            fill="#e9f1f0"
          />
          <Path
            d="M49 12L47 29 56 35M48 48L48 61 63 67M49 79L49 94 71 100M48 106L49 116 67 122"
            stroke="#bfced4"
            strokeWidth="3"
            fill="none"
          />
        </>
      ) : kind === 'rock' ? (
        <>
          <Path d="M8 131L16 104 36 87 64 89 85 108 94 134 70 143 28 142Z" fill={`url(#${id})`} />
          <Path
            d="M16 104L37 95 50 115 29 142 8 131ZM50 115L66 98 85 108 94 134 72 139Z"
            fill="#738b9a"
          />
          <Path d="M16 104L36 87 64 89 82 106 67 109 57 104 46 112 33 102 23 112Z" fill="#eef4f6" />
          <Path d="M32 117L26 131M64 117L72 132" stroke="#536c7a" strokeWidth="2" opacity=".7" />
        </>
      ) : (
        <>
          <Path
            d="M10 117Q8 109 17 106L81 112Q94 116 91 132L83 142 16 136Q7 131 10 117Z"
            fill="#695447"
          />
          <Path d="M18 113L80 119M20 121L75 127M17 130L77 136" stroke="#af8761" strokeWidth="3" />
          <Ellipse cx="82" cy="127" rx="11" ry="15" fill="#c2a27b" />
          <Ellipse cx="82" cy="127" rx="7" ry="10" fill="none" stroke="#866446" strokeWidth="1.5" />
          <Ellipse cx="82" cy="127" rx="3" ry="5" fill="none" stroke="#987350" strokeWidth="1" />
          <Path
            d="M10 114Q11 106 22 105L78 111 86 117 68 119 51 115 31 114 20 117Z"
            fill="#f3f7f6"
          />
          <Path d="M37 107L40 96 46 95 44 109" fill="#6a5140" />
        </>
      )}
    </Svg>
  );
}
