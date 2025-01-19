import { SpotType } from '@/models/models';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock} from 'lucide-react';
interface HomePageProps {
    spotTypes: SpotType[];
  }
export const HomePage = ({spotTypes}: HomePageProps) => {
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
        <div className="min-h-screen bg-white pt-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                <h1 className="text-6xl font-bold text-black mb-6">
                    schoenfeld.
                    <span className="text-gray-300">.</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-medium text-black">Executive Summary</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Drei Tage Spaß in der Uckermark! Pool | Hot Tub | Olympiade | Bingo | Clubkeller | Geiles Essen uvm.
                            <br></br>
                            Dieses Jahr an Pfingsten!
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-5 w-5" />
                            <span>3. bis 6. Juni 2025</span>
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

                {/* Accommodation Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {spotTypes.map((option) => (
                        <motion.div
                            key={option.name}
                            whileHover={{ y: -5 }}
                            className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-xl font-medium text-black mb-2">{option.name}</h3>
                            <span className={`inline-block px-2 py-1 rounded text-sm mb-4 ${option.currentCount === option.limit
                                ? "bg-gray-200 text-gray-700"
                                : "bg-black text-white"
                                }`}>
                                {option.currentCount}/{option.limit}
                            </span>
                            <p className="text-gray-600">{option.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Shifts Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-medium text-black mb-6">Was gibt's neues?</h2>
                    <div className="prose prose-gray max-w-none">
                        <ul className="space-y-2 text-gray-700">
                            <li>Es gibt dieses Jahr aus finanziellen und organisatorischen Gründen keine Samstagstickets.</li>
                            <li>Dafür gibt es weitere Abstufung der Tickets, z.B. für Tipis.</li>
                            <li>Das Programm wird um Workshops und Kulturelles erweitert. Bitte melden, wer Workshops o.ä. anbieten möchte!</li>
                            <li>Musik tagsüber draußen 👯‍♂️</li>
                            <li>Das Schichtsystem wird etwas angepasst: Alle müssen nun am Sonntag zwischen 10 und 12 eine Aufräumschicht machen.</li>
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
                                src={`/images/${index}.jpg`}
                                alt={`Gallery image ${index}`}
                                className="object-cover w-full h-full"
                            />
                            {/* Optional overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;