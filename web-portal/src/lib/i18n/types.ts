export type Locale = 'pt-BR' | 'en-US'

export interface Translations {
  common: {
    signIn: string
    signOut: string
    getStarted: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    update: string
    loading: string
    error: string
    success: string
    close: string
    confirm: string
    back: string
    next: string
    previous: string
    search: string
    filter: string
    actions: string
  }
  auth: {
    login: {
      title: string
      subtitle: string
      email: string
      password: string
      forgotPassword: string
      signInWithGoogle: string
      dontHaveAccount: string
      signUp: string
      errors: {
        invalidEmail: string
        userNotFound: string
        wrongPassword: string
        invalidCredential: string
        tooManyRequests: string
        networkError: string
        generic: string
      }
    }
    register: {
      title: string
      subtitle: string
      name: string
      email: string
      password: string
      confirmPassword: string
      alreadyHaveAccount: string
      signIn: string
    }
  }
  dashboard: {
    title: string
    subtitle: string
    stats: {
      apiCalls: string
      documentsAnalyzed: string
      activeApiKeys: string
      chatMessages: string
    }
    recentActivity: string
    recentActivityDescription: string
    quickActions: {
      analyzeDocument: string
      analyzeDocumentDesc: string
      chatWithAI: string
      chatWithAIDesc: string
      generateReport: string
      generateReportDesc: string
    }
    plan: {
      starter: string
      upgrade: string
      frameworksIncluded: string
      perMonth: string
    }
    trends: {
      fromLastMonth: string
      thisMonth: string
      thisWeek: string
      starterPlanLimit: string
      approachingLimit: string
    }
    activity: {
      documentAnalyzed: string
      apiKeyCreated: string
      chatSession: string
      integrationConfigured: string
      success: string
      hoursAgo: string
      daysAgo: string
      dayAgo: string
    }
  }
  navigation: {
    dashboard: string
    apiKeys: string
    secrets: string
    integrations: string
    documents: string
    compliance: string
    chat: string
    billing: string
    team: string
    settings: string
  }
  apiKeys: {
    title: string
    subtitle: string
    create: string
    name: string
    created: string
    lastUsed: string
    status: string
    actions: string
    active: string
    revoked: string
    expired: string
    revoke: string
    copy: string
    show: string
    hide: string
    usage: string
    quota: string
    newKeyCreated: string
    keyCopied: string
    loading: string
    used: string
    starterPlanAllows: string
    upgradeForMore: string
    createNew: string
    createdSuccessfully: string
    saveKeyNow: string
    giveDescriptiveName: string
    yourNewApiKey: string
    copyToClipboard: string
    important: string
    keyShownOnce: string
    enterKeyName: string
    close: string
  }
  documents: {
    title: string
    subtitle: string
    upload: string
    usage: string
    used: string
    quota: string
    documentsUsed: string
    monthlyQuota: string
    uploaded: string
    compliance: string
    status: {
      analyzed: string
      analyzing: string
    }
  }
  compliance: {
    title: string
    subtitle: string
    overallScore: string
    frameworks: string
    frameworkCompliance: string
    gaps: string
    recentGaps: string
    compliant: string
    needsAttention: string
    lastChecked: string
    thisMonth: string
  }
  chat: {
    title: string
    subtitle: string
    poweredBy: string
    messagesUsed: string
    placeholder: string
    send: string
    suggestedQuestions: {
      lgpd: string
      hipaa: string
      iso27001: string
      fda: string
    }
  }
  billing: {
    title: string
    subtitle: string
    currentPlan: string
    active: string
    renewsOn: string
    invoices: string
    upgrade: string
    downgrade: string
    availablePlans: string
    perMonth: string
    perYear: string
    save: string
    popular: string
    current: string
    updatePaymentMethod: string
    plans: {
      starter: {
        name: string
        description: string
      }
      professional: {
        name: string
        description: string
      }
      enterprise: {
        name: string
        description: string
      }
    }
    features: {
      dedicatedAccountManager: string
      slaGuarantee: string
    }
  }
  settings: {
    title: string
    profile: string
    notifications: string
    appearance: string
    security: string
    updateProfile: string
    fullName: string
    email: string
    role: string
    saveChanges: string
    emailNotifications: string
    emailNotificationsDesc: string
    complianceAlerts: string
    complianceAlertsDesc: string
    usageAlerts: string
    usageAlertsDesc: string
    theme: string
    changePassword: string
    enable2FA: string
    adminAccess: string
    adminAccessDesc: string
    currentAccessLevel: string
    customizeAppearance: string
    manageAccountSecurity: string
  }
  team: {
    title: string
    subtitle: string
    inviteMember: string
    members: string
    role: string
    status: string
    joined: string
  }
  secrets: {
    title: string
    subtitle: string
    addSecret: string
    securityNotice: string
    securityNoticeText: string
  }
  integrations: {
    title: string
    subtitle: string
    connected: string
    disconnected: string
    connect: string
    disconnect: string
    configure: string
  }
}

