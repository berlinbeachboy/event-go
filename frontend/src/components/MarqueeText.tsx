import { motion } from 'framer-motion';

interface MarqueeTextProps {
    text: string;
    speed?: number;
    className?: string;
    textClassName?: string;
    separator?: string;
}

export const MarqueeText = ({
    text,
    speed = 100,
    className = "bg-black py-3",
    textClassName = "text-white/80 font-medium tracking-wide",
    separator = "★"
}: MarqueeTextProps) => {
    // Calculate appropriate duration based on content length
    const fullText = `${separator} ${text} `;
    const baseSpeed = speed * (fullText.length / 10); 
    
    return (
        <div className={`relative w-full overflow-hidden ${className}`}>
            {/* Gradient masks for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20  z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20  z-10" />
            
            <div className="flex">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: "0%" }}
                        animate={{ x: "-100%" }}
                        transition={{
                            duration: baseSpeed,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0,
                        }}
                        className="flex-shrink-0 whitespace-nowrap"
                    >
                        <span className={`inline-block ${textClassName}`}>
                            {fullText.repeat(6)} {/* Reduced repeats for better performance */}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MarqueeText;