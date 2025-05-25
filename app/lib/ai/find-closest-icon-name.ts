import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';

let model: use.UniversalSentenceEncoder | undefined;
const initModel = async () => {
  if (!model) {
    await tf.setBackend('cpu');
    model = await use.load();
  }

  return model;
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

export const generateKeyVectors = async (keys: string[]): Promise<number[][]> => {
  const model = await initModel();
  const keyVectors = await model.embed(keys);
  return keyVectors.arraySync() as number[][];
};

export const findClosestIconName = async (
  fieldName: string,
  dictionaryKeys: string[],
  precomputedVectors: number[][]
): Promise<string> => {
  const model = await initModel();

  const fieldVector = await model.embed(fieldName);
  const fieldArray = fieldVector.arraySync()[0] as number[];

  const similarities = precomputedVectors.map((keyVector, index) => ({
    similarity: cosineSimilarity(fieldArray, keyVector),
    key: dictionaryKeys[index],
  }));

  const { key } = similarities.reduce((max, current) => (current.similarity > max.similarity ? current : max), {
    similarity: -Infinity,
    key: '',
  });

  return key;
};
