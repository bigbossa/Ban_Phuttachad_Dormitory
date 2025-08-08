import { useTheme } from "@/providers/ThemeProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Sun, Moon, Globe } from "lucide-react";

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>{t("theme.title")}</span>
        </CardTitle>
        <CardDescription>
          {t("theme.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("theme.theme")}</Label>
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                <Sun className="h-4 w-4" />
                <span>{t("theme.light")}</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                <Moon className="h-4 w-4" />
                <span>{t("theme.dark")}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>{t("theme.language")}</span>
          </Label>
          <RadioGroup value={language} onValueChange={setLanguage}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="th" id="thai" />
              <Label htmlFor="thai" className="cursor-pointer">{t("theme.thai")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="english" />
              <Label htmlFor="english" className="cursor-pointer">{t("theme.english")}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTheme('light')}
              className={theme === 'light' ? 'border-primary' : ''}
            >
              <Sun className="mr-2 h-4 w-4" />
              {t("theme.lightTheme")}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTheme('dark')}
              className={theme === 'dark' ? 'border-primary' : ''}
            >
              <Moon className="mr-2 h-4 w-4" />
              {t("theme.darkTheme")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
