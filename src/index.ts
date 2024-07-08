import type { CloudlinkPacket } from "@williamhorning/cloudlink";
import type { Post } from "./types/lib/api/posts";
import type { Window } from "./types/plugin/init";
import type { Store } from "./types/lib/api";

declare const window: Window;

(async (Roarer) => {
  /// <reference path="roarer.d.ts" />

  class ExamplePlugin extends Roarer.RoarerPlugin {
    originalPost: (content: string, chat: string, attachments?: string[]) => Promise<void>;
    lastPost: Map<string, Post>;
    constructor() {
      super();
      this.lastPost = new Map<string, Post>();
      this.originalPost = Roarer.plugins.data.api.getState().post;
      
      const api = Roarer.plugins.data.api.getState();
      Roarer.plugins.data.cloudlink?.on("packet", (packet: CloudlinkPacket) => {
        if (packet.cmd === "direct" && "post_origin" in packet.val && packet.val.u === api.credentials?.username) {
          const chat = packet.val.post_origin;
          this.lastPost.set(chat, packet.val);
        }
      })
    }
    info() {
      return {
        name: "S/E/D",
        identifier: "sed",
        version: "1.0.0",
        description: "Adds s/replace/with/ to replace text in your last message.",
        author: "ShowierData9978",
      };
    }
    start() {
      console.log("sed Plugin started!");
      

      Roarer.plugins.data.api.setState((state: Store | Partial<Store> | Map<string, any>) => {
        // @ts-ignore
        const _post: (content: string, chat: string, ...args: any) => Promise<any> = state.post;
        // @ts-expect-error 
        state.post = async (content: string, chat: string, ...args: any) => {
          //sed
          if (content.match(/^s\/.*\/.*$/g)) {
            const replace = content.split("/")[1];
            const with_ = content.split("/")[2];

            const api = Roarer.plugins.data.api.getState();
            const lastPost = this.lastPost.get(chat);

            await api.editPost(lastPost?.post_id as string, lastPost?.p?.replace(replace, with_) as string);
            return
          }
          return await _post(content, chat, ...args);
        };
      });
    }

    stop() {
      console.log("sed Plugin stopped!");
      Roarer.plugins.data.api.setState((state: any) => {
        state.post = this.originalPost;
      });
    }

    settings() {
      return Roarer.React.createElement("div", null, "Settings");
    }
  }

  Roarer.plugins.register(new ExamplePlugin());
})(
  window.Roarer,
);