import type { FC } from "react";
import { memo } from "react";
import { Stack } from "@fluentui/react";
import { Colors } from "./Colors";
import { SourceBox } from "./SourceBox";
import { StatefulTargetBox as TargetBox } from "./TargetBox";

import { componentsExample } from "./componentsEx";
import { templateExample } from "./formTemplateEx";

export const Container: FC = memo(function Container() {
  return (
    <Stack horizontal>
      <Stack.Item style={{ width: 150, minWidth: 150 }}>
        {componentsExample.map((c) => {
          return <SourceBox color={c} />;
        })}
      </Stack.Item>

      <Stack.Item style={{ width: 600, minWidth: 600 }}>
        <Stack tokens={{ childrenGap: 15 }}>
          {templateExample.map((t) => {
            return (
              <Stack horizontal tokens={{ childrenGap: 15 }}>
                {t.map((c) => {
                  return (
                    <Stack.Item grow>
                      <TargetBox />
                    </Stack.Item>
                  );
                })}
              </Stack>
            );
          })}
        </Stack>
      </Stack.Item>
    </Stack>
  );
});
