import {
  Exercise,
  ExerciseVariant,
  ExerciseLoadType,
  ExerciseMuscleGroups,
  ExerciseEquipment,
} from "@/helpers/exercises/exercise";

export const defaultExerciseCollection: Exercise[] = [
  new Exercise({
    name: "Squat",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Standard",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "LB",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "HB",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: 'Discesa 3"',
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Fermo in buca",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Elastici in overload",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes, ExerciseMuscleGroups.quads],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bands,
        ],
      }),
    ],
  }),
  new Exercise({
    name: "Panca piana",
    variants: [
      new ExerciseVariant({
        name: undefined,
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bench,
        ],
      }),
      new ExerciseVariant({
        name: "Standard",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bench,
        ],
      }),
      new ExerciseVariant({
        name: 'Discesa 3"',
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bench,
        ],
      }),
      new ExerciseVariant({
        name: 'Fermo 3"',
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bench,
        ],
      }),
      new ExerciseVariant({
        name: "Elastici in overload",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
          ExerciseEquipment.bench,
        ],
      }),
    ],
  }),

  new Exercise({
    name: "Stacco",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.quads,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.forearms,
        ],
        equipment: [
          ExerciseEquipment.deadliftplatform,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Standard",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.quads,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.forearms,
        ],
        equipment: [
          ExerciseEquipment.deadliftplatform,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Regular",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.quads,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.forearms,
        ],
        equipment: [
          ExerciseEquipment.deadliftplatform,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: "Sumo",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.quads,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.forearms,
        ],
        equipment: [
          ExerciseEquipment.deadliftplatform,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
      new ExerciseVariant({
        name: 'Salita 3"',
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.quads,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.forearms,
        ],
        equipment: [
          ExerciseEquipment.deadliftplatform,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
      }),
    ],
  }),

  new Exercise({
    name: "Pull Up",
    variants: [
      new ExerciseVariant({
        name: undefined,
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
      }),
      new ExerciseVariant({
        name: "Presa prona",
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
      }),
      new ExerciseVariant({
        name: "Presa supina",
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
      }),
      new ExerciseVariant({
        name: "Fermo a metà salita",
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
      }),
      new ExerciseVariant({
        name: 'Salita 3"',
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
      }),
    ],
  }),

  new Exercise({
    name: "Dip",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.parallettes],
      }),
      new ExerciseVariant({
        name: "Standard",
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.parallettes],
      }),
      new ExerciseVariant({
        name: 'Discesa 3"',
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.parallettes],
      }),
      new ExerciseVariant({
        name: "Fermo in buca",
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.parallettes],
      }),
    ],
  }),

  new Exercise({
    name: "Muscle Up",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.bar],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Rematore",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.barbell, ExerciseEquipment.plates],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Australian Pull Up",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loaded,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.rings],
      }),
    ],
  }),

  new Exercise({
    name: "Pull Down",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.upperback],
        equipment: [ExerciseEquipment.machine],
      }),
    ],
  }),

  new Exercise({
    name: "Lat Machine",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.machine],
      }),
    ],
  }),

  new Exercise({
    name: "Pulley",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.upperback,
          ExerciseMuscleGroups.lowerback,
          ExerciseMuscleGroups.biceps,
        ],
        equipment: [ExerciseEquipment.machine],
      }),
    ],
  }),

  new Exercise({
    name: "Panca inclinata",
    variants: [
      new ExerciseVariant({
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.bench, ExerciseEquipment.barbell],
      }),
    ],
  }),

  new Exercise({
    name: "Croci",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.chest],
        equipment: [ExerciseEquipment.bench, ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Chest Press",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [ExerciseEquipment.isotonicmachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Push Up",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [
          ExerciseMuscleGroups.chest,
          ExerciseMuscleGroups.triceps,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Plank",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [
          ExerciseMuscleGroups.core,
          ExerciseMuscleGroups.shoulders,
        ],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Verticale",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [
          ExerciseMuscleGroups.shoulders,
          ExerciseMuscleGroups.core,
        ],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Military Press",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.shoulders,
          ExerciseMuscleGroups.triceps,
        ],
        equipment: [
          ExerciseEquipment.rack,
          ExerciseEquipment.barbell,
          ExerciseEquipment.plates,
        ],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Alzate laterali",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.shoulders],
        equipment: [ExerciseEquipment.dumbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Piegamenti in verticale",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [
          ExerciseMuscleGroups.shoulders,
          ExerciseMuscleGroups.triceps,
        ],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Pike Push Up",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [
          ExerciseMuscleGroups.shoulders,
          ExerciseMuscleGroups.triceps,
        ],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Arnold Press",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.shoulders,
          ExerciseMuscleGroups.triceps,
        ],
        equipment: [ExerciseEquipment.dumbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Stacco rumeno",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
        ],
        equipment: [ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Squat bulgaro",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.quads, ExerciseMuscleGroups.glutes],
        equipment: [ExerciseEquipment.box, ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Leg Press",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.quads],
        equipment: [ExerciseEquipment.isotonicmachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Hack Squat",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.quads],
        equipment: [ExerciseEquipment.isotonicmachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Goodmorning",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [
          ExerciseMuscleGroups.harmstrings,
          ExerciseMuscleGroups.glutes,
          ExerciseMuscleGroups.lowerback,
        ],
        equipment: [ExerciseEquipment.rack, ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Leg Extension",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.quads],
        equipment: [ExerciseEquipment.isotonicmachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Leg Curl",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.harmstrings],
        equipment: [ExerciseEquipment.isotonicmachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Hip Thrust",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.glutes],
        equipment: [ExerciseEquipment.box, ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Barchetta",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [ExerciseMuscleGroups.core],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Superman Hold",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.bodyweight,
        muscleGroups: [ExerciseMuscleGroups.core],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Calf Raises",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.calves],
        equipment: [ExerciseEquipment.box],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Skull Crusher",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.triceps],
        equipment: [ExerciseEquipment.bench, ExerciseEquipment.barbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Push Down",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.triceps],
        equipment: [ExerciseEquipment.cablemachine],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Estensioni tricipiti",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.triceps],
        equipment: [ExerciseEquipment.dumbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Bicep Curl",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.biceps],
        equipment: [ExerciseEquipment.dumbell],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Box Jump",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [ExerciseMuscleGroups.quads, ExerciseMuscleGroups.glutes],
        equipment: [ExerciseEquipment.box],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Hip Abductor",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),

  new Exercise({
    name: "Hip Adductor",
    variants: [
      new ExerciseVariant({
        uid: undefined,
        name: undefined,
        description: "",
        loadType: ExerciseLoadType.loadonly,
        muscleGroups: [],
        equipment: [],
        videoUrl: "",
      }),
    ],
  }),
];
