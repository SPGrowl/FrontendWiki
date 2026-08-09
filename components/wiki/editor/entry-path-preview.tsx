"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/type/entry";

interface EntryPathPreviewProps {
  breadcrumbs: BreadcrumbItemType[];
  href: string;
}

export function EntryPathPreview({ breadcrumbs, href }: EntryPathPreviewProps) {
  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-none border border-dashed border-border bg-muted/20 p-3">
      <span className="text-xs font-medium">路径预览</span>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <Link href={item.href}>{item.name}</Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <code className="text-xs text-muted-foreground">{href}</code>
    </div>
  );
}
