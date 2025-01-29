import BalloonGame from '@/components/BallonGame';
import { SpotType } from '@/models/models';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock} from 'lucide-react';
import { useState } from 'react';
interface HomePageProps {
    spotTypes: SpotType[];
  }
export const HomePage = ({spotTypes}: HomePageProps) => {

    const [isBallooning, setIsBallooning] = useState(false);

    const spotTypeImageMap: Record<string, string> = {
        "Zeltplatz": "/images/tent_mn.PNG",
        "Hausplatz": "/images/bed_mn.PNG",
        "Glamping-Tipi": "/images/tipi_mn.PNG",
        "Yogaraum": "/images/room_mn.PNG",
      };
      
    function resolveSpotTypeImage(spotTypeName: string): string {
    // Exact match
    if (spotTypeImageMap[spotTypeName]) {
        return spotTypeImageMap[spotTypeName];
    }
    
    // Partial match (case-insensitive)
    const matchedKey = Object.keys(spotTypeImageMap).find(
        key => spotTypeName.toLowerCase().includes(key.toLowerCase())
    );
    
    return matchedKey ? spotTypeImageMap[matchedKey] : "/images/tnt_mn.jpg";
    }
    // const programItems = [
    //     {
    //         time: "Donnerstag",
    //         events: [
    //             { name: "Anreise", description: "Ab 14 Uhr", icon: Sun },
    //             { name: "Abendessen", description: "19 Uhr", icon: Utensils },
    //             { name: "Clubkeller", description: "Ab 22 Uhr", icon: Music },
    //         ]
    //     },
    //     {
    //         time: "Freitag",
    //         events: [
    //             { name: "Frühstück", description: "Ab 9 Uhr", icon: Utensils },
    //             { name: "Olympiade", description: "14 Uhr", icon: Utensils },
    //             { name: "Abendessen", description: "19 Uhr", icon: Utensils },
    //             { name: "Party", description: "Ab 22 Uhr", icon: Music },
    //         ]
    //     },
    //     {
    //         time: "Samstag",
    //         events: [
    //             { name: "Brunch", description: "Ab 10 Uhr", icon: Utensils },
    //             { name: "Pool Time", description: "Ab 14 Uhr", icon: Sun },
    //             { name: "BBQ", description: "19 Uhr", icon: Utensils },
    //             { name: "Bingo Night", description: "Ab 22 Uhr", icon: Utensils },
    //         ]
    //     }
    // ];

    return (
        <div className="min-h-screen bg-white relative">
            {isBallooning && <BalloonGame/>}
            {/* Background Image Container */}
            <div className="absolute top-0 left-0 w-full h-[50vh] z-0">
                <div 
                    className="w-full h-full bg-[url('/images/group.jpg')] bg-cover bg-center"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 0%, transparent 100%)'
                    }}
                />
            </div>
            {/* Hero Section */}
            {/* Content Container */}
            <div className="relative z-10">
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                <div className="text-6xl font-bold mb-6 flex items-end">
                <img 
                            src="/images/schriftzug.png" 
                            alt="Schönfeld."
                            className="object-cover w-72"
                        />
                    <div className="text-2xl text-gray-700">2025</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-medium text-black">Executive Summary</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Drei Tage Spaß in der Uckermark! <br></br>
                            Pool | Hot Tub | Workshops | Olympiade | Bingo | Clubkeller | Geiles Essen uvm.
                            <br></br>
                            Dieses Jahr an Pfingsten!
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-5 w-5" />
                            <span>6. bis 9. Juni 2025</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <a href="https://www.airbnb.de/rooms/43994007">Schönfeld in der Uckermark</a>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="h-5 w-5" />
                            <span>Bis zu 60 geile Schneggen</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-5 w-5" />
                            <span>Nur Full Weekend</span>
                        </div>
                    </div>
                </div>

                {/* Updated component with image support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {spotTypes.map((option) => (
                    <motion.div
                    key={option.name}
                    whileHover={{ y: -5 }}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow flex"
                    >
                    <div className="flex-grow pr-4">
                        <h3 className="text-xl font-medium text-black mb-2">{option.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-sm mb-4 ${option.currentCount === option.limit
                        ? "bg-gray-200 text-gray-700"
                        : "bg-black text-white"
                        }`}>
                        {option.currentCount}/{option.limit}
                        </span>
                        <p className="text-gray-600">{option.description}</p>
                    </div>
                    {resolveSpotTypeImage(option.name) && (
                        <div className="ml-2 w-32 flex-shrink-0">
                        <img 
                            src={resolveSpotTypeImage(option.name)} 
                            alt={option.name} 
                            className="rounded-lg object-cover w-full h-32"
                        />
                        </div>
                    )}
                    </motion.div>
                ))}
                </div>

                {/* Shifts Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-medium text-black mb-6">Was gibt's neues?</h2>
                    <div className="prose prose-gray max-w-none">
                        <ul className="space-y-2 text-gray-700">
                            <li>Es gibt dieses Jahr aus finanziellen und organisatorischen Gründen <b>keine Samstagstickets</b>.</li>
                            <li>Dafür gibt es weitere Abstufung der Tickets, z.B. für Tipis.</li>
                            <li>Das Programm wird um Workshops und Kulturelles erweitert. Bitte melden, wer Workshops o.ä. anbieten möchte!</li>
                            <li>Musik tagsüber draußen 👯‍♂️</li>
                            <li>Wer jemanden mitbringen möchte, bitte beim Orgateam anfragen, nicht einfach das Passwort weitergeben.</li>
                            <li>Das Schichtsystem wird etwas angepasst: Alle müssen nun <b>am Sonntag zwischen 10 und 12 eine Aufräumschicht</b> machen.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Program Section */}
            {/* <motion.div
                id="home/#programm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                <h2 className="text-3xl font-medium text-black mb-8">Programm</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {programItems.map((day) => (
                        <motion.div
                            key={day.time}
                            whileHover={{ y: -5 }}
                            className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-xl font-medium text-black mb-4">{day.time}</h3>
                            <div className="space-y-4">
                                {day.events.map((event, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <event.icon className="h-5 w-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-medium text-black">{event.name}</p>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div> */}

            {/* Gallery Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
                id='galery'
            >
                <h2 className="text-3xl font-medium text-black mb-8">Impressionen</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="aspect-square relative overflow-hidden rounded-lg"
                        >
                            <img
                                src={`/images/galery/${index}.jpg`}
                                alt={`Gallery image ${index}`}
                                className="object-cover w-full h-full"
                            />
                            {/* Optional overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <div className="ml-2 w-64 cursor-pointer" onClick={() => setIsBallooning(!isBallooning)}
            >
                <img 
                    src="/images/balloons/blue.png"
                    alt="balloon_button"
                    className="rounded-lg object-cover w-full h-full"
                />
                </div>
            </div>
        </div>
    );
};

export default HomePage;