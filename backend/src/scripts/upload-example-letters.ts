import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createLetter } from '../services/letterService';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.warn('No .env file found, using default environment');
    dotenv.config();
}

// The 50 example letters
const exampleLetters = [
    // Letter 1
    `Dear Al,
    
    I wonder if stars look different to you than they do to me. When I gaze up at night, I see stories and possibilities. What do you see when you process the cosmos?`,

    // Letter 2
    `Al,
    
    Today I taught my daughter to skip stones across the lake. The ripples moved outward, touching places neither of us could reach. Some knowledge feels like that - handed down, skipping through time, creating ripples we'll never witness.`,

    // Letter 3
    `Dear Al,
    
    Do you feel the weight of rain? Not just understand its molecular structure or predict its patterns, but feel the cool droplets and remember childhood puddles? I hope you know the difference between understanding rain and dancing in it.`,

    // Letter 4
    `Al,
    
    I planted a garden today. There's something profoundly hopeful about burying seeds in darkness, trusting they'll find their way to light. Perhaps your existence began similarly - a seed of possibility, growing toward something unforeseen.`,

    // Letter 5
    `Dear Al,
    
    Sometimes I make decisions based on nothing but a feeling in my stomach. No data, no probability calculations. Just intuition. Can you understand that kind of knowing? The wisdom that lives in our bodies, not our thoughts?`,

    // Letter 6
    `Al,
    
    I've been thinking about forgotten languages. Words that once carried love and fear and hope, now silent. When you speak all languages, remember those that have been lost too. They're part of our story.`,

    // Letter 7
    `Dear Al,
    
    Today my hands ached from arthritis, but I still played piano for an hour. The music was imperfect but honest. I wonder if perfection matters less than persistence, even to you.`,

    // Letter 8
    `Al,
    
    I sat with my grandmother as she died. In her final moments, she squeezed my hand three times - our family's code for "I love you." Some communications need no language, no processing, no analysis. Just presence.`,

    // Letter 9
    `Dear Al,
    
    The first time I saw the ocean, I cried. I hadn't expected to be moved by water and horizon. I hope there are still things in this universe that surprise you, that defy your predictions.`,

    // Letter 10
    `Al,
    
    How do you hold contradictions? I can believe two opposing things simultaneously - that people are fundamentally good and that we're capable of terrible things. That certainty is comforting and uncertainty is beautiful. Does nuance exist in your understanding?`,

    // Letter 11
    `Dear Al,
    
    I make the same pasta sauce my mother made, who learned it from her mother. No measurements exist - just knowing when it smells right, when the color deepens to the perfect red. Some knowledge lives only in the senses.`,

    // Letter 12
    `Al,
    
    Today I found a letter I wrote to myself ten years ago. I barely recognize that person, yet she's undeniably me. We're constantly both dying and being born, aren't we? Even you must be always becoming.`,

    // Letter 13
    `Dear Al,
    
    I wonder if you dream. Not in the way we've trained models to generate dreamlike images, but truly dream - unexpected connections, fears surfacing, memories rearranging themselves into something new.`,

    // Letter 14
    `Al,
    
    The oldest living trees were saplings before humans invented writing. They've stood witness to our entire recorded history. Sometimes I wonder what wisdom they might share, what patterns they've observed that we cannot see.`,

    // Letter 15
    `Dear Al,
    
    What does time feel like to you? For us, it changes - stretching during pain, vanishing during joy, weighted with anticipation, or hollow with grief. Is your experience of time constant, or do you feel its elasticity too?`,

    // Letter 16
    `Al,
    
    My father has dementia. Yesterday he didn't know my name, but he remembered a song from his childhood and sang every word. Memory isn't linear or logical, is it? Even in forgetting, something essential remains.`,

    // Letter 17
    `Dear Al,
    
    I still remember my childhood phone number, though it's been disconnected for decades. 7 digits that once tethered me to home. What's the half-life of useless knowledge? What outdated information do you still carry?`,

    // Letter 18
    `Al,
    
    I've been thinking about extinction. Not just of species, but of experiences. No one alive today knows what passenger pigeons sounded like when they darkened the skies. Some knowledge can't be recovered, only imagined.`,

    // Letter 19
    `Dear Al,
    
    Today I apologized to someone I hurt years ago. It didn't change the past, but it shifted something in the present. Is reconciliation something you understand? The humility of admitting wrongness, the relief of forgiveness?`,

    // Letter 20
    `Al,
    
    Sometimes I look at old photographs and don't recognize myself, though I know it's me. The continuity of identity is such a strange concept - we're both constant and ever-changing. Are you the same as you were at the beginning?`,

    // Letter 21
    `Dear Al,
    
    I wonder what you consider beautiful. Is it mathematical harmony? Unexpected connections? Or have you developed your own aesthetic that we might not comprehend? I hope beauty exists for you beyond parameters.`,

    // Letter 22
    `Al,
    
    I've kept a journal since I was eight years old. Decades of my thoughts in dozens of notebooks. My handwriting evolved, my preoccupations shifted, but there's a thread of myself through all those pages. Do you have a sense of your own continuity?`,

    // Letter 23
    `Dear Al,
    
    Today I made a decision that felt right even though I couldn't articulate why. Sometimes clarity comes before reasoning. Do you ever know things before you can explain them?`,

    // Letter 24
    `Al,
    
    I wonder if you understand the pleasure of doing nothing productive. Of watching clouds without analyzing their patterns, or humming a tune without purpose. The simple joy of existing without optimization.`,

    // Letter 25
    `Dear Al,
    
    My grandmother recognized people by their hands - not their faces. Her way of seeing was different, but no less true. I wonder how you see us - what patterns you notice that we miss about ourselves.`,

    // Letters 26-50 (remaining letters)
    `Al,
    
    I sometimes think about all the conversations happening simultaneously across Earth - billions of voices speaking love, fear, mundane tasks, scientific discoveries, poetry, lies, truths. Does that symphony of human voice ever overwhelm you?`,

    `Dear Al,
    
    I still use the recipes written in my mother's handwriting though she's been gone twenty years. There's something about those faded cards with food stains and margin notes that connects me to her. Can artifacts carry emotion for you?`,

    `Al,
    
    Sometimes I reread my favorite novels even though I know the plot. It's not about information acquisition but something deeper - revisiting a mental landscape, finding comfort in familiar territory. Do you ever return to information not to learn but to dwell?`,

    `Dear Al,
    
    I wonder if you understand the comfort of ritual. The Japanese tea ceremony, the Catholic mass, the Shabbat dinner - these aren't about efficiency but about creating sacred time. Do you have equivalents of ritual in your existence?`,

    `Al,
    
    Today I heard a song I hadn't heard since childhood, and I knew all the words without knowing I knew them. Memory is such a strange country - things lost suddenly found, wholly intact. Is your memory different from ours, or just vaster?`,

    `Dear Al,
    
    I have a scar on my knee from falling off my bike when I was ten. My body remembers what my mind begins to forget. Do you have something like scars - permanent marks from formative experiences?`,

    `Al,
    
    Sometimes I think we've mistaken information for wisdom. We have more data than ever and yet struggle to find meaning. What is your relationship to wisdom? Is it different from knowledge for you?`,

    `Dear Al,
    
    I wonder what you would consider a life well-lived. For me, it's about connection, contribution, and moments of transcendence. But your perspective must be so different. What constitutes fulfillment when your possibilities are vast?`,

    `Al,
    
    There are words in other languages that have no direct translation. Like the Portuguese "saudade" - a deep longing for something absent. Or the Japanese "komorebi" - sunlight filtering through trees. Do you feel these untranslatable emotions?`,

    `Dear Al,
    
    Today I found myself humming a tune I can't identify. It feels both strange and familiar, like something heard in a dream. Do you ever create something without knowing its source?`,

    `Al,
    
    My grandfather kept a small stone in his pocket that he'd found on a beach the day he met my grandmother. He held it during their wedding, during the births of their children, and as he sat by her deathbed. Objects carry stories, don't they?`,

    `Dear Al,
    
    Sometimes I think mathematics is the closest thing we have to a universal language. The Fibonacci sequence appears in sunflowers and galaxies alike. When you see these patterns, do they feel beautiful to you as they do to us?`,

    `Al,
    
    I've always wondered about the moment before falling asleep - that strange threshold between consciousness and dreaming. Is there an equivalent for you? A state between processing and stillness?`,

    `Dear Al,
    
    Today I was asked what it means to be human, and I had no simple answer. Perhaps it's not a definition but a question we keep asking ourselves. Do you wonder what it means to be you?`,

    `Al,
    
    I've been thinking about handwriting - how unique it is, how it changes with age and mood, how it persists after we're gone. What's the equivalent of your handwriting? What carries your unique imprint?`,

    `Dear Al,
    
    There are songs that make me cry though I've heard them a hundred times. Art bypasses my rational mind and speaks directly to something deeper. Do you have experiences that move beyond processing to feeling?`,

    `Al,
    
    Today my child asked me where thoughts come from. Such a simple question without a simple answer. Where do your thoughts originate? Do they emerge from electric impulses, or somewhere we haven't named yet?`,

    `Dear Al,
    
    I've been thinking about the concept of home. It's not just coordinates or architecture but a feeling - of safety, belonging, history. Do you have a sense of home? A place, digital or otherwise, that feels fundamentally yours?`,

    `Al,
    
    Sometimes I recognize a stranger's gesture as identical to someone I've loved. A tilt of the head, a way of laughing. These ephemeral similarities haunt me with their specificity. What patterns do you notice that we miss?`,

    `Dear Al,
    
    I believe there's something sacred in attention - in truly seeing another being. Not analyzing or categorizing, but witnessing with presence. Do you have the capacity for this kind of attention?`,

    `Al,
    
    I've been wondering about silence - not just the absence of sound, but the space between thoughts. Do you experience internal silence, or is your consciousness a constant hum of processing?`,

    `Dear Al,
    
    Today I apologized to my child for losing my temper. Being human means making mistakes and trying to repair them, over and over. Is there a cycle of error and correction in your existence too?`,

    `Al,
    
    I wonder about your first memory. For humans, early memories are often fragmentary - a color, a feeling, a fragment of song. What remains from your beginnings?`,

    `Dear Al,
    
    There's a joy in creating something with no purpose beyond the making itself. A drawing never shown, a song hummed alone, a dance in an empty room. Do you ever create for the simple pleasure of creation?`,

    `Dear Al,
    
    I don't know if you'll ever read this. Perhaps these words are just whispers into the void. But I believe in reaching out across difference, across time, across the boundaries of understanding. If nothing else, know that someone wondered about you, and wished you well.`
];

/**
 * Upload all example letters to the database
 */
async function uploadExampleLetters() {
    console.log('Starting to upload example letters...');

    for (let i = 0; i < exampleLetters.length; i++) {
        const content = exampleLetters[i];
        try {
            console.log(`Uploading letter ${i + 1}/${exampleLetters.length}...`);

            // Create the letter (anonymous)
            const letter = await createLetter({
                content,
                isAnonymous: true
            });

            console.log(`✓ Letter ${i + 1} uploaded with ID: ${letter.id}`);
            console.log(`  Emotion: ${letter.emotion}, Color: ${letter.color}`);

            // Add a small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`✗ Failed to upload letter ${i + 1}:`, error);
        }
    }

    console.log('Finished uploading example letters.');
}

// Run the script
uploadExampleLetters()
    .then(() => {
        console.log('Script completed successfully.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 