import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  GeneratedJwkKeyPair,
  JwkAlgorithm,
  JwkModulusLength,
  generateJwkKeyPair,
  isEcAlgorithm,
  isJwkGenerationSupported,
} from "@/helpers/JwkHelper";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  ClipboardCopy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tip } from "../Tip/Tip";
import { Warning } from "../Warning/Warning";

type KeyFormat = "jwk" | "pem";

type GenerateJwkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the public JWK once the user confirms they saved the private key. */
  onUsePublicKey: (publicJwk: string) => void;
};

const modulusLengths: JwkModulusLength[] = [2048, 3072, 4096];

const algorithms: { value: JwkAlgorithm; label: string }[] = [
  { value: "RS256", label: "RS256 (RSA)" },
  { value: "ES256", label: "ES256 (EC P-256)" },
  { value: "ES384", label: "ES384 (EC P-384)" },
  { value: "ES512", label: "ES512 (EC P-521)" },
];

const CodeBlock = ({ value }: { value: string }) => (
  <ScrollArea className="h-52 rounded-md border bg-muted/50">
    <pre className="whitespace-pre-wrap break-all p-3 font-mono text-xs">
      {value}
    </pre>
  </ScrollArea>
);

const GenerateJwkDialog = ({
  open,
  onOpenChange,
  onUsePublicKey,
}: GenerateJwkDialogProps) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  const [algorithm, setAlgorithm] = useState<JwkAlgorithm>("RS256");
  const [modulusLength, setModulusLength] = useState<JwkModulusLength>(2048);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyPair, setKeyPair] = useState<GeneratedJwkKeyPair | null>(null);
  const [format, setFormat] = useState<KeyFormat>("jwk");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isPrivateKeyRevealed, setIsPrivateKeyRevealed] = useState(false);

  // Drops the generated key material from memory together with the dialog state.
  const close = () => {
    setKeyPair(null);
    setIsAcknowledged(false);
    setIsDiscarding(false);
    setIsGenerating(false);
    setIsPrivateKeyRevealed(false);
    setFormat("jwk");
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (keyPair && !isAcknowledged) {
      setIsDiscarding(true);
      return;
    }

    close();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      setKeyPair(await generateJwkKeyPair(algorithm, modulusLength));
    } catch {
      toast({
        variant: "destructive",
        title: t("Components.GenerateJwkDialog.GenerationFailed"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsePublicKey = () => {
    if (!keyPair) {
      return;
    }

    onUsePublicKey(keyPair.publicJwkCompact);
    toast({ title: t("Components.GenerateJwkDialog.PublicKeyApplied") });
    close();
  };

  // This is the only way the private key ever leaves the dialog, so the link has
  // to be in the document and the URL must stay alive until the download starts.
  const handleDownload = (value: string, fileName: string) => {
    const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const renderKeyPanel = ({
    jwk,
    pem,
    fileName,
    info,
    isSensitive = false,
  }: {
    jwk: string;
    pem: string;
    fileName: string;
    info: string;
    isSensitive?: boolean;
  }) => {
    const value = format === "jwk" ? jwk : pem;
    const isMasked = isSensitive && !isPrivateKeyRevealed;

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{info}</p>
        {isMasked ? (
          <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-md border bg-muted/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPrivateKeyRevealed(true)}
            >
              <Eye className="me-2 h-4 w-4" />
              {t("Components.GenerateJwkDialog.Reveal")}
            </Button>
          </div>
        ) : (
          <CodeBlock value={value} />
        )}
        <div className="flex justify-end gap-2">
          {isSensitive && isPrivateKeyRevealed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="me-auto"
              onClick={() => setIsPrivateKeyRevealed(false)}
            >
              <EyeOff className="me-2 h-4 w-4" />
              {t("Components.GenerateJwkDialog.Hide")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(value)}
          >
            <ClipboardCopy className="me-2 h-4 w-4" />
            {t("Components.GenerateJwkDialog.Copy")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              handleDownload(
                value,
                `${fileName}.${format === "jwk" ? "json" : "pem"}`,
              )
            }
          >
            <Download className="me-2 h-4 w-4" />
            {t("Components.GenerateJwkDialog.Download")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t("Components.GenerateJwkDialog.Title")}
          </DialogTitle>
          <DialogDescription>
            {t("Components.GenerateJwkDialog.Description")}
          </DialogDescription>
        </DialogHeader>

        {!keyPair ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("Components.GenerateJwkDialog.Algorithm")}</Label>
                <Select
                  value={algorithm}
                  onValueChange={(value) => setAlgorithm(value as JwkAlgorithm)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {algorithms.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {t("Components.GenerateJwkDialog.AlgorithmInfo")}
                </p>
              </div>

              {!isEcAlgorithm(algorithm) && (
                <div className="space-y-2">
                  <Label>{t("Components.GenerateJwkDialog.KeySize")}</Label>
                  <Select
                    value={String(modulusLength)}
                    onValueChange={(value) =>
                      setModulusLength(Number(value) as JwkModulusLength)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modulusLengths.map((length) => (
                        <SelectItem key={length} value={String(length)}>
                          {t("Components.GenerateJwkDialog.KeySizeOption", {
                            bits: length,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Tip>{t("Components.GenerateJwkDialog.SetupTip")}</Tip>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t("Actions.Cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !isJwkGenerationSupported()}
              >
                {isGenerating && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t("Components.GenerateJwkDialog.Generate")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <Warning>
                {t("Components.GenerateJwkDialog.PrivateKeyWarning")}
              </Warning>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {t("Components.GenerateJwkDialog.KeyId")}:{" "}
                  <span className="font-mono text-foreground">
                    {keyPair.kid}
                  </span>
                </p>
                <div className="flex gap-1 rounded-md border p-0.5">
                  {(["jwk", "pem"] as KeyFormat[]).map((keyFormat) => (
                    <Button
                      key={keyFormat}
                      type="button"
                      size="sm"
                      variant={format === keyFormat ? "secondary" : "ghost"}
                      onClick={() => setFormat(keyFormat)}
                    >
                      {keyFormat.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="private">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="private">
                    {t("Components.GenerateJwkDialog.PrivateKey")}
                  </TabsTrigger>
                  <TabsTrigger value="public">
                    {t("Components.GenerateJwkDialog.PublicKey")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="private">
                  {renderKeyPanel({
                    jwk: keyPair.privateJwk,
                    pem: keyPair.privatePem,
                    fileName: `jwk-private-${keyPair.kid}`,
                    info: t("Components.GenerateJwkDialog.PrivateKeyInfo"),
                    isSensitive: true,
                  })}
                </TabsContent>
                <TabsContent value="public">
                  {renderKeyPanel({
                    jwk: keyPair.publicJwk,
                    pem: keyPair.publicPem,
                    fileName: `jwk-public-${keyPair.kid}`,
                    info: t("Components.GenerateJwkDialog.PublicKeyInfo"),
                  })}
                </TabsContent>
              </Tabs>
            </div>

            {isDiscarding ? (
              <div className="space-y-3 rounded-lg border border-destructive p-3">
                <p className="text-sm">
                  {t("Components.GenerateJwkDialog.DiscardConfirm")}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDiscarding(false)}
                  >
                    {t("Components.GenerateJwkDialog.KeepKeys")}
                  </Button>
                  <Button type="button" variant="destructive" onClick={close}>
                    {t("Components.GenerateJwkDialog.Discard")}
                  </Button>
                </div>
              </div>
            ) : (
              <DialogFooter className="flex-col gap-3 sm:flex-col sm:items-stretch sm:space-x-0">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <Label
                    htmlFor="jwk-acknowledgement"
                    className="font-normal leading-snug"
                  >
                    {t("Components.GenerateJwkDialog.Acknowledge")}
                  </Label>
                  <Switch
                    id="jwk-acknowledgement"
                    checked={isAcknowledged}
                    onCheckedChange={setIsAcknowledged}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    {t("Actions.Cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUsePublicKey}
                    disabled={!isAcknowledged}
                  >
                    {t("Components.GenerateJwkDialog.UsePublicKey")}
                  </Button>
                </div>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateJwkDialog;
