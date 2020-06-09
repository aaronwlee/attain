import { Request, Response } from "../mod.ts";
import { XXssProtectionOptions, xXssProtection } from "../helmat/x-xxs-protection.ts";
import { hidePoweredBy } from "../helmat/hide-powered-by.ts";
import { dnsPrefetchControl, DnsPrefetchControlOptions } from "../helmat/dns-prefetch-control.ts";
import { dontSniffMimetype } from "../helmat/dont-sniff-mimetype.ts";
import { frameGuard, FrameguardOptions } from "../helmat/frame-guard.ts";

interface SecurityProps {
  xss?: XXssProtectionOptions | boolean;
  removePoweredBy?: boolean;
  DNSPrefetchControl?: DnsPrefetchControlOptions | boolean;
  noSniff?: boolean;
  frameguard?: FrameguardOptions | boolean;
}

export const security = (options?: SecurityProps) => {
  const { xss = true, removePoweredBy = true, DNSPrefetchControl = true, noSniff = true, frameguard = true } = options || {};
  return function security(req: Request, res: Response) {
    if (xss) {
      typeof xss === "boolean" ? xXssProtection()(req, res) : xXssProtection(xss)(req, res);
    }

    if (removePoweredBy) {
      hidePoweredBy()(req, res);
    }

    if (noSniff) {
      dontSniffMimetype()(req, res);
    }

    if (DNSPrefetchControl) {
      typeof DNSPrefetchControl === "boolean" ? dnsPrefetchControl()(req, res) : dnsPrefetchControl(DNSPrefetchControl)(req, res);
    }

    if (frameguard) {
      typeof frameguard === "boolean" ? frameGuard()(req, res) : frameGuard(frameguard)(req, res);
    }
  }
}