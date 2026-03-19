import mongoose from "mongoose";
import Tutorial from "./models/Tutorial.js";
import Blog from "./models/Blog.js";
import dotenv from "dotenv";

dotenv.config();

const tutorials = [
  {
    title: "Perfect Squat Technique",
    content: "Learn the proper form for squats to build strength and prevent injuries. This comprehensive tutorial covers everything from basic stance to advanced variations.",
    difficulty: "beginner",
    category: "strength",
    duration: "15 minutes",
    equipment: ["Barbell", "Squat rack"],
    caloriesBurned: 50,
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    steps: [
      "Stand with feet shoulder-width apart, toes slightly pointed outward",
      "Engage your core and keep your chest up",
      "Lower your hips back and down as if sitting in a chair",
      "Keep your knees behind your toes and back straight",
      "Go down until your thighs are parallel to the floor",
      "Push through your heels to return to starting position"
    ],
    imageUrl: "https://picsum.photos/seed/squat/800/450.jpg",
    videoUrl: "https://example.com/squat-tutorial",
    tags: ["legs", "glutes", "strength", "compound"],
    isPublished: true,
    publishedAt: new Date(),
    views: 1250,
    likes: 89
  },
  {
    title: "HIIT Workout for Fat Loss",
    content: "High-Intensity Interval Training is the most effective way to burn fat and improve cardiovascular fitness. This 20-minute workout will push you to your limits.",
    difficulty: "intermediate",
    category: "cardio",
    duration: "20 minutes",
    equipment: ["Timer", "Exercise mat"],
    caloriesBurned: 300,
    muscleGroups: ["Full Body"],
    steps: [
      "Warm up with 5 minutes of light cardio",
      "Perform 30 seconds of high-intensity exercise",
      "Rest for 30 seconds",
      "Repeat for 10 rounds",
      "Cool down with 5 minutes of stretching"
    ],
    imageUrl: "https://picsum.photos/seed/hiit/800/450.jpg",
    videoUrl: "https://example.com/hiit-workout",
    tags: ["fat loss", "cardio", "hiit", "endurance"],
    isPublished: true,
    publishedAt: new Date(),
    views: 2100,
    likes: 156
  },
  {
    title: "Deadlift Form Guide",
    content: "Master the king of all exercises with proper deadlift technique. This tutorial covers conventional, sumo, and Romanian deadlift variations.",
    difficulty: "advanced",
    category: "strength",
    duration: "20 minutes",
    equipment: ["Barbell", "Weight plates"],
    caloriesBurned: 80,
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back", "Traps"],
    steps: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees, grip bar just outside knees",
      "Keep back straight, chest up, and shoulders back",
      "Drive through heels, extending hips and knees simultaneously",
      "Lock out at the top with glutes and core tight",
      "Control the weight on the way down"
    ],
    imageUrl: "https://picsum.photos/seed/deadlift/800/450.jpg",
    videoUrl: "https://example.com/deadlift-guide",
    tags: ["back", "legs", "posterior chain", "strength"],
    isPublished: true,
    publishedAt: new Date(),
    views: 1800,
    likes: 134
  },
  {
    title: "Core Strengthening Routine",
    content: "Build a strong and stable core with this comprehensive routine. A strong core is essential for all athletic movements and injury prevention.",
    difficulty: "beginner",
    category: "core",
    duration: "12 minutes",
    equipment: ["Exercise mat"],
    caloriesBurned: 40,
    muscleGroups: ["Abs", "Obliques", "Lower Back"],
    steps: [
      "Start with planks for 30 seconds",
      "Perform 15 crunches",
      "Do 20 Russian twists",
      "Complete 15 leg raises",
      "Finish with 30-second side planks each side",
      "Rest 30 seconds between exercises"
    ],
    imageUrl: "https://picsum.photos/seed/core/800/450.jpg",
    videoUrl: "https://example.com/core-workout",
    tags: ["abs", "core", "stability", "beginner"],
    isPublished: true,
    publishedAt: new Date(),
    views: 980,
    likes: 67
  },
  {
    title: "Pull-up Progression System",
    content: "Go from zero to hero with our proven pull-up progression system. This tutorial will help you build the strength needed for your first pull-up.",
    difficulty: "advanced",
    category: "upper body",
    duration: "18 minutes",
    equipment: ["Pull-up bar", "Resistance bands"],
    caloriesBurned: 70,
    muscleGroups: ["Lats", "Biceps", "Rhomboids", "Core"],
    steps: [
      "Start with assisted pull-ups using resistance bands",
      "Practice negative pull-ups (slow eccentric)",
      "Do inverted rows to build back strength",
      "Progress to band-assisted pull-ups",
      "Finally attempt unassisted pull-ups",
      "Aim for 3 sets of 5-8 reps"
    ],
    imageUrl: "https://picsum.photos/seed/pullup/800/450.jpg",
    videoUrl: "https://example.com/pullup-progression",
    tags: ["back", "pull-ups", "upper body", "progressive"],
    isPublished: true,
    publishedAt: new Date(),
    views: 1450,
    likes: 98
  },
  {
    title: "Push-up Variations",
    content: "Master the push-up and its many variations. This tutorial covers everything from beginner modifications to advanced variations for maximum muscle development.",
    difficulty: "intermediate",
    category: "Upper Body",
    content: "Master various push-up variations to build chest, shoulder, and tricep strength. From beginner to advanced progressions.",
    steps: [
      "Start with wall push-ups if needed, progress to knee push-ups",
      "Master standard push-ups with perfect form",
      "Try incline push-ups for upper chest focus",
      "Progress to decline push-ups for lower chest",
      "Advanced: try diamond push-ups or one-arm push-ups"
    ],
    duration: "15 minutes",
    equipment: ["None"],
    caloriesBurned: 45,
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Core"],
    author: "David Kim",
    tags: ["push-ups", "chest", "upper body", "bodyweight"],
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    videoUrl: "https://example.com/pushup-video"
  }
];

const blogs = [
  {
    title: "The Science Behind Muscle Growth",
    slug: "science-behind-muscle-growth",
    excerpt: "Understanding hypertrophy and the biological processes that drive muscle development for optimal results.",
    category: "workout",
    author: "Dr. Sarah Johnson",
    authorBio: "PhD in Exercise Physiology, 10+ years experience in fitness research",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    readTime: "5 min read",
    tags: ["muscle growth", "hypertrophy", "science", "training"],
    content: `
      <h4>Understanding Muscle Hypertrophy</h4>
      <p>Muscle growth, or hypertrophy, occurs when muscle fibers sustain damage or injury. The body repairs damaged fibers by fusing them, which increases the mass and size of the muscles.</p>
      
      <h4>Key Factors for Muscle Growth</h4>
      <ul>
        <li><strong>Progressive Overload:</strong> Gradually increasing the weight, frequency, or number of repetitions in your strength training routine.</li>
        <li><strong>Proper Nutrition:</strong> Consuming adequate protein (1.6-2.2g per kg of body weight) to support muscle repair and growth.</li>
        <li><strong>Rest and Recovery:</strong> Muscles need time to recover and grow stronger.</li>
        <li><strong>Consistency:</strong> Regular training sessions are essential for continuous progress.</li>
      </ul>
      
      <h4>Optimal Training Frequency</h4>
      <p>Research suggests training each muscle group 2-3 times per week with at least 48 hours between sessions for optimal recovery and growth.</p>
    `
  },
  {
    title: "Nutrition Timing for Optimal Performance",
    slug: "nutrition-timing-optimal-performance",
    excerpt: "When and what to eat around your workouts to maximize performance and recovery results.",
    category: "nutrition",
    author: "Mike Chen",
    authorBio: "Certified Nutritionist and Sports Dietitian",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    featuredImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    readTime: "4 min read",
    tags: ["nutrition", "timing", "performance", "recovery"],
    content: `
      <h4>Pre-Workout Nutrition</h4>
      <p>Eat 2-3 hours before training: Focus on complex carbohydrates and moderate protein. Examples: oatmeal with banana, or chicken breast with rice.</p>
      
      <h4>During Workout</h4>
      <p>For sessions over 90 minutes, consider electrolyte drinks or easily digestible carbohydrates to maintain energy levels.</p>
      
      <h4>Post-Workout Nutrition</h4>
      <p>Within 30-60 minutes after training, consume a mix of protein and carbohydrates (3:1 or 4:1 ratio) to optimize recovery and muscle protein synthesis.</p>
      
      <h4>Sample Post-Workout Meals</h4>
      <ul>
        <li>Protein shake with banana</li>
        <li>Grilled chicken with sweet potato</li>
        <li>Greek yogurt with berries and honey</li>
      </ul>
    `
  },
  {
    title: "The Importance of Rest Days",
    slug: "importance-rest-days-recovery",
    excerpt: "Why recovery days are crucial for long-term fitness success and injury prevention.",
    category: "recovery",
    author: "Lisa Martinez",
    authorBio: "Physical Therapist and Recovery Specialist",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    featuredImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    readTime: "3 min read",
    tags: ["recovery", "rest", "injury prevention", "wellness"],
    content: `
      <h4>Why Rest Days Matter</h4>
      <p>Rest days are when your muscles actually repair and grow stronger. Without adequate recovery, you risk overtraining, injury, and diminished performance.</p>
      
      <h4>Signs You Need More Recovery</h4>
      <ul>
        <li>Persistent muscle soreness lasting more than 72 hours</li>
        <li>Decreased performance or strength</li>
        <li>Mood changes or irritability</li>
        <li>Poor sleep quality</li>
        <li>Elevated resting heart rate</li>
      </ul>
      
      <h4>Active Recovery Ideas</h4>
      <p>On rest days, consider light activities like walking, stretching, yoga, or swimming to promote blood flow and aid recovery without stressing your muscles.</p>
    `
  },
  {
    title: "Building Sustainable Fitness Habits",
    slug: "building-sustainable-fitness-habits",
    excerpt: "How to create lasting exercise habits that stick for the long term without burnout.",
    category: "motivation",
    author: "Tom Wilson",
    authorBio: "Behavioral Psychology and Fitness Coach",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    featuredImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    readTime: "6 min read",
    tags: ["habits", "consistency", "motivation", "psychology"],
    content: `
      <h4>Start Small</h4>
      <p>Begin with manageable goals. Even 10-15 minutes of daily exercise can build the foundation for lasting habits.</p>
      
      <h4>Consistency Over Intensity</h4>
      <p>It's better to exercise moderately 3-4 times per week than intensely once and then burn out.</p>
      
      <h4>Find Your "Why"</h4>
      <p>Connect your fitness goals to deeper values and long-term objectives. This intrinsic motivation is more sustainable than external pressure.</p>
      
      <h4>Environment Design</h4>
      <p>Set up your environment to make healthy choices easier. Lay out workout clothes the night before, keep healthy snacks visible, and remove obstacles to exercise.</p>
    `
  },
  {
    title: "Supplements: What Really Works",
    slug: "supplements-what-really-works",
    excerpt: "Evidence-based guide to fitness supplements that actually deliver results.",
    category: "nutrition",
    author: "Dr. Alex Kumar",
    authorBio: "Sports Medicine Physician and Nutrition Researcher",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    featuredImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    readTime: "7 min read",
    tags: ["supplements", "evidence-based", "performance", "safety"],
    content: `
      <h4>Proven Supplements</h4>
      <ul>
        <li><strong>Protein Powder:</strong> Convenient way to meet daily protein needs, especially post-workout.</li>
        <li><strong>Creatine:</strong> Most researched supplement, proven to improve strength and power output.</li>
        <li><strong>Caffeine:</strong> Enhances focus, energy, and performance during workouts.</li>
        <li><strong>Beta-Alanine:</strong> Improves muscular endurance for high-intensity efforts.</li>
      </ul>
      
      <h4>Supplements with Limited Evidence</h4>
      <p>Many popular supplements like BCAAs, glutamine, and most test boosters have limited scientific support for their claims.</p>
      
      <h4>Quality Matters</h4>
      <p>Choose third-party tested supplements from reputable brands to ensure purity and accurate labeling.</p>
    `
  },
  {
    title: "Overcoming Training Plateaus",
    slug: "overcoming-training-plateaus",
    excerpt: "Strategies to break through training plateaus and continue making progress.",
    category: "workout",
    author: "Rachel Green",
    authorBio: "Strength and Conditioning Coach",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    featuredImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    readTime: "5 min read",
    tags: ["plateaus", "progress", "strength", "breakthrough"],
    content: `
      <h4>Recognizing a Plateau</h4>
      <p>A plateau occurs when you've been training consistently but haven't seen progress in 4-6 weeks across multiple workouts.</p>
      
      <h4>Plateau-Breaking Strategies</h4>
      <ul>
        <li><strong>Change Rep Ranges:</strong> If you've been doing 8-12 reps, try 5-6 or 15-20 reps.</li>
        <li><strong>Alter Exercise Selection:</strong> Replace compound movements with variations.</li>
        <li><strong>Manipulate Volume:</strong> Increase total sets or training frequency.</li>
        <li><strong>Try New Training Methods:</strong> Drop sets, supersets, or pause reps.</li>
        <li><strong>Deload:</strong> Take a week of reduced intensity to allow full recovery.</li>
      </ul>
    `
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Tutorial.deleteMany({});
    await Blog.deleteMany({});

    // Insert tutorials
    const insertedTutorials = await Tutorial.insertMany(tutorials);
    console.log(`Inserted ${insertedTutorials.length} tutorials`);

    // Insert blogs
    const insertedBlogs = await Blog.insertMany(blogs);
    console.log(`Inserted ${insertedBlogs.length} blogs`);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
