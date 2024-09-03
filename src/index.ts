import { BeatmapDecoder } from "osu-parsers";
import { StandardRuleset } from "osu-standard-stable";
import { sampleMap } from "./osuUtils";
import { SSPMParsedMap } from "./sspmParser";

function easeInExpoDeq(x: number) {
  return x === 0 ? 0 : Math.pow(2, 35 * x - 35);
}

export function calculatePerformancePoints(
  starRating: number,
  accuracy: number
) {
  return Math.round(
    Math.pow((starRating * easeInExpoDeq(accuracy) * 100) / 2, 2) / 1000
  );
}

export async function rateMap(map: SSPMParsedMap) {
  const decoder = new BeatmapDecoder();
  const beatmap1 = decoder.decodeFromString(sampleMap);

  const notes = map.markers
    .filter((marker) => marker.type === 0)
    .map((marker) => ({
      time: marker.position,
      x: marker.data["field0"].x,
      y: marker.data["field0"].y,
    }));

  for (const note of notes) {
    const hittable = beatmap1.hitObjects[0].clone();
    hittable.startX = Math.round((note.x / 2) * 100);
    hittable.startY = Math.round((note.y / 2) * 100);
    hittable.startTime = note.time;
    beatmap1.hitObjects.push(hittable);
  }
  const ruleset = new StandardRuleset();
  const mods = ruleset.createModCombination("RX");
  const difficultyCalculator = ruleset.createDifficultyCalculator(beatmap1);
  const difficultyAttributes = difficultyCalculator.calculateWithMods(mods);
  return difficultyAttributes.starRating;
}
