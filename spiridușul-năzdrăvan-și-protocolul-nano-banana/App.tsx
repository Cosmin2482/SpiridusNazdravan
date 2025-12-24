
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Snow from './components/Snow';
import ElfCam from './components/ElfCam';
import Elf from './components/Elf';
import StoryView from './components/StoryView';
import { AppState, MagicLetter } from './types';
import { generateMagicLetter, generateElfSticker, generateChristmasBackground } from './services/geminiService';
import { Volume2, VolumeX, Send } from 'lucide-react';

declare var Howl: any;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.START);
  const [userName, setUserName] = useState('');
  const [originalPhoto, setOriginalPhoto] = useState<string>('');
  const [elfSticker, setElfSticker] = useState<string>('');
  const [storyBg, setStoryBg] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [letter, setLetter] = useState<MagicLetter | null>(null);
  const [elfSpeech, setElfSpeech] = useState("Auzi, boss? Stai puțin că nu te găsesc în sistem...");

  const sounds = useRef<{ [key: string]: any }>({});

  const initAudio = useCallback(() => {
    if (typeof Howl === 'undefined') return false;
    if (Object.keys(sounds.current).length > 0) return true;

    sounds.current = {
      ambient: new Howl({ src: ['https://assets.mixkit.co/music/preview/mixkit-jingle-bells-hip-hop-version-544.mp3'], loop: true, volume: 0.15 }),
      shutter: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2560/2560-preview.mp3'], volume: 0.6 }),
      scribble: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2585/2585-preview.mp3'], loop: true, volume: 0.4 }),
      whoosh: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], volume: 0.8 }),
      magic: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], volume: 0.4 }),
      footsteps: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.3 }),
      bells: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3'], volume: 0.5 }),
      hohoho: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2560/2560-preview.mp3'], volume: 0.7 }) // Placeholder for hohoho
    };
    return true;
  }, []);

  useEffect(() => {
    Object.values(sounds.current).forEach(s => s.mute(isMuted));
  }, [isMuted]);

  const handleStart = () => {
    if (initAudio()) {
      sounds.current.ambient?.play();
      sounds.current.bells?.play();
      setState(AppState.CAMERA_PULL);
      setElfSpeech("Moșul te urmărește... Stai să-ți facem un update de look!");
      
      setTimeout(() => {
        setState(AppState.ELF_CAM);
      }, 2500);
    }
  };

  const handleCapture = (photo: string) => {
    sounds.current.shutter?.play();
    sounds.current.magic?.play();
    setOriginalPhoto(photo);
    setElfSpeech("Bombă! Poză de icon. Acum zi-mi cum te cheamă pe bune?");
    setState(AppState.NAME_INPUT);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    sounds.current.scribble?.play();
    setElfSpeech(`Ușor, ${userName}, spiridușul dă cu sclipici acum...`);
    setState(AppState.LOADING);

    try {
      const [magicData, sticker, bg] = await Promise.all([
        generateMagicLetter(userName, originalPhoto),
        generateElfSticker(userName, originalPhoto),
        generateChristmasBackground(userName)
      ]);

      setLetter(magicData);
      setElfSticker(sticker || originalPhoto);
      setStoryBg(bg || "");

      setTimeout(() => {
        sounds.current.scribble?.stop();
        sounds.current.whoosh?.play();
        sounds.current.bells?.play();
        setElfSpeech("Gata, ești oficial personaj principal! ✨");
        setState(AppState.HANDOVER);
        setTimeout(() => {
          setState(AppState.REVEAL);
        }, 1200);
      }, 3000);
    } catch (err) {
      setState(AppState.REVEAL);
    }
  };

  const resetApp = () => {
    sounds.current.bells?.play();
    setState(AppState.START);
    setUserName('');
    setOriginalPhoto('');
    setElfSticker('');
    setStoryBg('');
    setLetter(null);
    setElfSpeech("Auzi, boss? Stai puțin că nu te găsesc în sistem...");
    sounds.current.ambient?.stop();
  };

  return (
    <div className="relative dvh-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <Snow />
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#000] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-[1]" style={{ backgroundImage: 'radial-gradient(circle at center, #C21807 0%, transparent 80%)' }} />

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 z-[120] p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-[#FFD700] backdrop-blur-xl active:scale-90"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      <main className="z-20 w-full flex flex-col items-center px-6 relative max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {state === AppState.START && (
            <motion.div 
              key="start" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-12"
            >
              <Elf state="approaching" speech={elfSpeech} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-16 py-6 bg-gradient-to-r from-[#C21807] to-[#8B0000] text-white font-black text-2xl uppercase italic rounded-[2rem] shadow-[0_15px_50px_rgba(194,24,7,0.5)] border-b-8 border-black/30"
              >
                CHECK VIBE 🎄
              </motion.button>
            </motion.div>
          )}

          {state === AppState.CAMERA_PULL && (
            <motion.div key="pull" className="flex flex-col items-center">
              <Elf state="scanning" speech={elfSpeech} />
            </motion.div>
          )}

          {state === AppState.ELF_CAM && (
            <motion.div key="cam" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center">
               <ElfCam onCapture={handleCapture} />
            </motion.div>
          )}

          {state === AppState.NAME_INPUT && (
            <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-12 w-full">
              <Elf state="idle" speech={elfSpeech} />
              <form onSubmit={handleNameSubmit} className="w-full relative px-2">
                <input
                  type="text"
                  placeholder="CUM TE CHEAMĂ?"
                  value={userName}
                  autoFocus
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-10 py-7 bg-white/5 border-4 border-[#FFD700] rounded-[2.5rem] text-white placeholder-white/10 text-3xl font-black text-center focus:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all outline-none uppercase italic"
                  required
                />
                <button type="submit" className="absolute right-0 bottom-[-20px] p-7 bg-[#01796F] text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white/20">
                  <Send size={32} />
                </button>
              </form>
            </motion.div>
          )}

          {state === AppState.LOADING && (
            <motion.div key="loading" className="flex flex-col items-center space-y-12">
              <Elf state="scribbling" speech={elfSpeech} />
              <div className="w-72 space-y-4">
                <div className="naughty-nice-scanner"><div className="scanner-bar" /></div>
                <div className="text-xs text-center font-mono uppercase tracking-[0.4em] text-white/40 animate-pulse">Analizăm puritatea vibe-ului...</div>
              </div>
            </motion.div>
          )}

          {state === AppState.HANDOVER && (
            <motion.div key="handover" className="flex flex-col items-center">
               <Elf state="handing" speech="URMĂREȘTE POVESTEA! ✨" />
               <motion.div 
                 initial={{ scale: 0, opacity: 1 }}
                 animate={{ scale: 45, opacity: 1 }}
                 transition={{ duration: 1.2, ease: "circIn" }}
                 className="fixed inset-0 bg-white z-[100] pointer-events-none rounded-full"
               />
            </motion.div>
          )}

          {state === AppState.REVEAL && letter && (
            <motion.div key="reveal" className="fixed inset-0 z-[50]">
              <StoryView 
                letter={letter} 
                userName={userName} 
                profilePhoto={originalPhoto}
                elfSticker={elfSticker}
                artUrl={storyBg || `https://image.pollinations.ai/prompt/magical%20christmas%20background%20disney%20style?width=720&height=1280&nologo=true&seed=${userName}`}
              />
              <motion.button 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                onClick={resetApp}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 px-14 py-6 bg-gradient-to-r from-red-600 to-red-900 text-white rounded-full font-black shadow-2xl z-[110] active:scale-95 hover:scale-105 transition-all text-xl uppercase italic border-b-4 border-black/30"
              >
                ALTĂ TURĂ! 🎅
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
