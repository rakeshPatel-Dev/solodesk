import { useState } from 'react'
import {
  Search, LifeBuoy, BookOpen, FileText, Video, MessageCircle,
  Zap, Users, Shield, CreditCard, Globe, Smartphone,
  Award, ChevronRight, ArrowRight, Headphones, Clock,
  CheckCircle, ExternalLink, MessageSquare, Mail, Phone,
  ThumbsUp, ThumbsDown, Copy, Download, Printer
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Types
type Article = {
  id: string
  title: string
  description: string
  category: string
  views: number
  helpful: number
  updatedAt: string
  isPopular?: boolean
  isNew?: boolean
}

type Category = {
  id: string
  name: string
  icon: React.ElementType
  description: string
  articleCount: number
  color: string
}

// Mock data
const categories: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Zap,
    description: 'Set up your account and start managing projects in minutes',
    articleCount: 12,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'projects',
    name: 'Projects & Tasks',
    icon: BookOpen,
    description: 'Master project creation, tracking, and collaboration',
    articleCount: 24,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'payments',
    name: 'Payments & Billing',
    icon: CreditCard,
    description: 'Manage invoices, payments, and financial insights',
    articleCount: 18,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'team',
    name: 'Team Collaboration',
    icon: Users,
    description: 'Work together efficiently with your team',
    articleCount: 15,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: Shield,
    description: 'Keep your data safe and secure',
    articleCount: 8,
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Globe,
    description: 'Connect with your favorite tools',
    articleCount: 10,
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    icon: Smartphone,
    description: 'Manage everything on the go',
    articleCount: 9,
    color: 'from-sky-500 to-blue-500',
  },
  {
    id: 'faq',
    name: 'FAQ',
    icon: MessageCircle,
    description: 'Answers to common questions',
    articleCount: 32,
    color: 'from-gray-500 to-slate-500',
  },
]

const popularArticles: Article[] = [
  {
    id: '1',
    title: 'How to create your first project',
    description: 'Step-by-step guide to setting up and managing projects',
    category: 'Getting Started',
    views: 12450,
    helpful: 98,
    updatedAt: '2024-01-15',
    isPopular: true,
  },
  {
    id: '2',
    title: 'Setting up payment methods',
    description: 'Add bank accounts and configure payment settings',
    category: 'Payments & Billing',
    views: 8920,
    helpful: 95,
    updatedAt: '2024-01-20',
    isPopular: true,
  },
  {
    id: '3',
    title: 'Inviting team members',
    description: 'Add colleagues and manage permissions',
    category: 'Team Collaboration',
    views: 7650,
    helpful: 92,
    updatedAt: '2024-01-18',
  },
  {
    id: '4',
    title: 'Understanding project analytics',
    description: 'Track performance and insights',
    category: 'Projects & Tasks',
    views: 5430,
    helpful: 88,
    updatedAt: '2024-01-22',
    isNew: true,
  },
  {
    id: '5',
    title: 'Security best practices',
    description: 'Protect your account and data',
    category: 'Security & Privacy',
    views: 4980,
    helpful: 96,
    updatedAt: '2024-01-19',
  },
  {
    id: '6',
    title: 'Mobile app setup guide',
    description: 'Get started with our iOS and Android apps',
    category: 'Mobile App',
    views: 3210,
    helpful: 91,
    updatedAt: '2024-01-21',
  },
]

const recentUpdates: Article[] = [
  {
    id: '7',
    title: 'Introducing AI-powered insights',
    description: 'Smart recommendations for your projects',
    category: 'Updates',
    views: 2340,
    helpful: 97,
    updatedAt: '2024-01-23',
    isNew: true,
  },
  {
    id: '8',
    title: 'New integration with Slack',
    description: 'Get notifications directly in Slack',
    category: 'Integrations',
    views: 1870,
    helpful: 94,
    updatedAt: '2024-01-22',
  },
  {
    id: '9',
    title: 'Bulk payment processing',
    description: 'Handle multiple invoices at once',
    category: 'Payments & Billing',
    views: 1560,
    helpful: 89,
    updatedAt: '2024-01-21',
  },
]

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking "Forgot Password" on the login page. We\'ll send you a secure link to create a new password.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. No hidden fees or cancellation charges.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes, we offer a 14-day free trial with access to all features. No credit card required to start.',
  },
  {
    question: 'How do I export my data?',
    answer: 'You can export your project data, invoices, and reports from the Settings > Export Data section.',
  },
  {
    question: 'Do you offer discounts for non-profits?',
    answer: 'Yes, we offer a 30% discount for registered non-profit organizations. Contact our sales team for verification.',
  },
]

function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})

  const handleFeedback = (articleId: string, isHelpful: boolean) => {
    setFeedbackGiven(prev => ({ ...prev, [articleId]: true }))
    // API call to record feedback would go here
    console.log(`Article ${articleId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`)
  }

  const handleContactSupport = () => {
    // Open support chat or email
    console.log('Opening support channel')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 via-primary/0 to-transparent">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 animate-in fade-in slide-in-from-bottom-4">
              <LifeBuoy className="mr-1 h-3 w-3" />
              Help Center
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How can we help you?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers, guides, and resources to get the most out of our platform
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-12 bg-background/50 backdrop-blur-sm border-border/60 focus:border-primary/50"
                />
              </div>
              <Button size="lg" className="h-12 shadow-sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {['payment setup', 'invite team', 'export data', 'api access'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full bg-muted/50 px-3 py-1 text-xs transition-colors hover:bg-muted"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by category</h2>
          <p className="mt-2 text-muted-foreground">Find the help you need, organized by topic</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.id}
                className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="relative p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                  <div className="relative">
                    <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${category.color} p-2.5 text-white shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {category.articleCount} articles
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Popular & Recent Articles */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Popular Articles */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Popular articles</h2>
                <p className="text-sm text-muted-foreground">Most viewed by the community</p>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-4">
              {popularArticles.map((article) => (
                <div
                  key={article.id}
                  className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.isNew && (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                            New
                          </Badge>
                        )}
                        {article.isPopular && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{article.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.views.toLocaleString()} views</span>
                        <span>{article.helpful}% helpful</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full">
              View all articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Recent Updates */}
          <Card className="border-border/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Recent updates</h2>
                <p className="text-sm text-muted-foreground">New features and improvements</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              {recentUpdates.map((article) => (
                <div
                  key={article.id}
                  className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.isNew && (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                            Just added
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{article.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                        <span>{article.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full">
              See all updates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </section>

      {/* FAQ Section with Tabs */}
      <section className="border-y border-border/40 bg-muted/20 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-muted-foreground">Quick answers to common questions</p>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.slice(0, 3).map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border/50 bg-background px-4">
                    <AccordionTrigger className="hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="billing" className="mt-6">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.slice(3, 6).map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border/50 bg-background px-4">
                    <AccordionTrigger className="hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border/50 bg-background px-4">
                    <AccordionTrigger className="hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              Still have questions? <button className="text-primary hover:underline">Contact our support team</button>
            </p>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Need more help?</h2>
          <p className="mt-2 text-muted-foreground">We're here to support you every step of the way</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 p-6 text-center transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Live chat</h3>
            <p className="mt-1 text-sm text-muted-foreground">Chat with our support team</p>
            <p className="mt-2 text-xs text-muted-foreground">Response time: &lt; 2 min</p>
            <Button className="mt-4 w-full" onClick={handleContactSupport}>
              Start chat
            </Button>
          </Card>

          <Card className="border-border/50 p-6 text-center transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Email support</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get detailed answers</p>
            <p className="mt-2 text-xs text-muted-foreground">Response time: &lt; 24 hours</p>
            <Button variant="outline" className="mt-4 w-full">
              Send email
            </Button>
          </Card>

          <Card className="border-border/50 p-6 text-center transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Phone support</h3>
            <p className="mt-1 text-sm text-muted-foreground">Talk to a human</p>
            <p className="mt-2 text-xs text-muted-foreground">Available for enterprise</p>
            <Button variant="outline" className="mt-4 w-full">
              Schedule call
            </Button>
          </Card>

          <Card className="border-border/50 p-6 text-center transition-all hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Community forum</h3>
            <p className="mt-1 text-sm text-muted-foreground">Learn from peers</p>
            <p className="mt-2 text-xs text-muted-foreground">24/7 community support</p>
            <Button variant="outline" className="mt-4 w-full">
              Join community
            </Button>
          </Card>
        </div>
      </section>

      {/* Resource Footer */}
      <div className="border-t border-border/40 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Was this help center useful?</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-8 gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Yes
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  No
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5" />
                Download as PDF
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenterPage