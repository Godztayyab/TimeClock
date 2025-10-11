type Translation = {
  emailConfig: {
    defaultEmail: string;
  };
  author: {
    name: string;
  };
  MetaData: {
    title: string;
    description: string;
  };
  app: {
    name: string;
  };
};

export const en: Translation = {
  emailConfig: {
    defaultEmail: "onboarding@tahirabbas.com",
  },
  author: {
    name: "Tahir Abbas",
  },
  MetaData: {
    title: "TimeClock | Tahir Abbas",
    description: "A time tracking application by Tahir Abbas",
  },
  app: {
    name: "TimeClock",
  },
};  
