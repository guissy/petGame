import { usePetStore } from './usePetStore.ts';
import PetFeedingCanvas from './PetFeedingCanvas.tsx';
import PetFeedingCanvas2 from './PetFeedingCanvas.tsx';

const PetFeedingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      {/*<PetFeedingCanvas />*/}
      <PetFeedingCanvas2 />
      <button
        onClick={() => usePetStore.getState().feedPet()}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded shadow"
      >
        喂食
      </button>
    </div>
  );
};

export default PetFeedingPage;

