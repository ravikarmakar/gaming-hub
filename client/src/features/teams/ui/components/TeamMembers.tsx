import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Crown,
  User,
  Target,
  Shield,
  Trash,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface TeamMembersTypes {
  _id: string;
  username: string;
  avatar: string;
  user: string;
  roleInTeam: "rusher" | "sniper" | "support" | "igl" | "player";
}

interface Props {
  members: TeamMembersTypes[];
  owner: boolean;
  onRemove: (id: string) => void;
  onEditRole: (role: string, id: string) => void;
  isLoading?: boolean;
}

const roleIcons = {
  rusher: Target,
  sniper: Target,
  support: Shield,
  igl: Crown,
  player: User,
};

export const TeamMembers = ({
  members,
  owner,
  onRemove,
  onEditRole,
  isLoading,
}: Props) => {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleRoleEdit = (memberId: string, currentRole: string) => {
    setEditingRole(memberId);
    setSelectedRole(currentRole);
  };

  const roles = [
    { label: "Rusher", icon: Target, value: "rusher" },
    { label: "Sniper", icon: Target, value: "sniper" },
    { label: "support", icon: Shield, value: "support" },
    { label: "player", icon: User, value: "player" },
  ];

  useEffect(() => {
    if (!isLoading) {
      setEditingRole(null);
      setSelectedRole("");
    }
  }, [isLoading]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const isMemberOwner = member.roleInTeam === "igl" && owner;

          return (
            <Card
              key={member._id}
              className="relative border-none bg-purple-800/30"
            >
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.username} />
                      <AvatarFallback>
                        {member.username
                          ? member.username[0].toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-purple-100">
                        {member.username}
                      </p>
                      <p className="text-xs text-purple-400">
                        {isMemberOwner ? "Team Owner (IGL)" : "Team Member"}
                      </p>

                      {editingRole === member.user ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-8 px-2 py-1 text-purple-100 bg-purple-900 border-none hover:bg-purple-800"
                            >
                              {roles.find((r) => r.value === selectedRole)
                                ?.label || "Select Role"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="text-purple-100 border-none bg-purple-900/30">
                            {roles.map((role) => (
                              <DropdownMenuItem
                                key={role.value}
                                onClick={() => setSelectedRole(role.value)}
                                className={`hover:bg-purple-800 ${
                                  selectedRole === role.value
                                    ? "bg-purple-800"
                                    : ""
                                }`}
                              >
                                <role.icon className="w-4 h-4 mr-2" />
                                {role.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => {
                                onEditRole(selectedRole, member.user);
                                setEditingRole(null);
                              }}
                              className="justify-center mt-2 font-semibold text-purple-100 bg-purple-950 hover:bg-purple-800"
                            >
                              {isLoading ? "Saving.." : "Save"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRole(null);
                              }}
                              className="justify-center mt-1 text-purple-300 bg-transparent hover:bg-purple-800"
                            >
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = roleIcons[member.roleInTeam];
                            return <Icon className="w-4 h-4 text-purple-300" />;
                          })()}
                          <span className="text-purple-200 capitalize">
                            {member.roleInTeam}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {owner &&
                    (editingRole === member.user ? null : (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          {!isMemberOwner && (
                            <MoreHorizontal className="w-5 h-5 text-purple-300 hover:text-purple-100" />
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="text-gray-300 border-none bg-purple-700/40">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleEdit(member.user, member.roleInTeam)
                            }
                          >
                            <Target className="w-4 h-4 mr-2 text-purple-300" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemove(member.user)}
                            disabled={isLoading}
                          >
                            <Trash className="w-4 h-4 mr-2 text-purple-300" />
                            {isLoading ? "Removing.." : "Remove"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled
                            className="flex items-center gap-2 cursor-default"
                          >
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-300">Ownership</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
