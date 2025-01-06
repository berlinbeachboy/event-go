import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Music, Utensils, Sun } from 'lucide-react';

export const HomePage = () => {
    const programItems = [
        {
            time: "Donnerstag",
            events: [
                { name: "Anreise", description: "Ab 14 Uhr", icon: Sun },
                { name: "Abendessen", description: "19 Uhr", icon: Utensils },
                { name: "Clubkeller", description: "Ab 22 Uhr", icon: Music },
            ]
        },
        {
            time: "Freitag",
            events: [
                { name: "Frühstück", description: "Ab 9 Uhr", icon: Utensils },
                { name: "Olympiade", description: "14 Uhr", icon: Utensils },
                { name: "Abendessen", description: "19 Uhr", icon: Utensils },
                { name: "Party", description: "Ab 22 Uhr", icon: Music },
            ]
        },
        {
            time: "Samstag",
            events: [
                { name: "Brunch", description: "Ab 10 Uhr", icon: Utensils },
                { name: "Pool Time", description: "Ab 14 Uhr", icon: Sun },
                { name: "BBQ", description: "19 Uhr", icon: Utensils },
                { name: "Bingo Night", description: "Ab 22 Uhr", icon: Utensils },
            ]
        }
    ];

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
                            Drei Tage Spaß in der Uckermark! Pool | Hot Tub | Olympiade | Bingo | Clubkeller | Geiles Essen uvm
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-5 w-5" />
                            <span>3 Tage</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <span>Uckermark</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="h-5 w-5" />
                            <span>Gemeinschaft</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-5 w-5" />
                            <span>Flexibel</span>
                        </div>
                    </div>
                </div>

                {/* Accommodation Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        {
                            title: "Bettplatz",
                            status: "Verfügbar",
                            description: "Bett oder Matratze inkl. Bettwäsche im gewohnten Mehrbettzimmer."
                        },
                        {
                            title: "Zeltplatz",
                            status: "Verfügbar",
                            description: "Platz im Zelt (oder unten im Haus); Iso, Schlafsack & ggfls. Zelt sind mitzubringen."
                        },
                        {
                            title: "Samstag",
                            status: "Verfügbar",
                            description: "Anreise ab Samstag Mittag. Schlafen (sofern benötigt) wie Zeltplatz. (ca. 45€ inkl. Essen)"
                        }
                    ].map((option) => (
                        <motion.div
                            key={option.title}
                            whileHover={{ y: -5 }}
                            className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-xl font-medium text-black mb-2">{option.title}</h3>
                            <span className={`inline-block px-2 py-1 rounded text-sm mb-4 ${option.status === "Ausgebucht"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-black text-white"
                                }`}>
                                {option.status}
                            </span>
                            <p className="text-gray-600">{option.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Shifts Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-medium text-black mb-6">Schichten</h2>
                    <div className="prose prose-gray max-w-none">
                        <ul className="space-y-2 text-gray-700">
                            <li>Schichten geben entweder 1 Punkt oder 2 Punkte. Diese Info steht in Klammern hinter den Schichten.</li>
                            <li>Wer Do oder Fr ankommt, braucht 2 Punkte, wer Sa ankommt, braucht nur 1 Punkt.</li>
                            <li>Ihr könnt die Schichten im Nachhinein ändern und auch mit anderen tauschen.</li>
                            <li>Nehmt bitte zwei unterschiedliche Schichten, nicht 2x Keller aufräumen.</li>
                            <li>Bei Fragen zu eurer Schicht bitte auf Geisch zugehen.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Program Section */}
            <motion.div
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
            </motion.div>

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