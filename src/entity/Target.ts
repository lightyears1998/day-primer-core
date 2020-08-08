import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, UpdateDateColumn
} from "typeorm";
import { Timespan } from "./Timespan";
import { Attachment } from "./Attachment";
import { Action } from "./Action";
import { User } from "./User";


export enum TargetStatus {
    /** 活跃状态 */
    ACTIVE = "active",

    /** 暂停 */
    SUSPENDED = "suspended",

    /** 完成 */
    COMPLETED = "completed",

    /** 隐藏 */
    HIDDEN = "hidden",

    /** 删除 */
    DELETED = "deleted"
}


@Entity()
export class TargetEntity {
    @PrimaryGeneratedColumn("uuid")
    public id?: string;

    @CreateDateColumn()
    public createdAt?: Date

    @UpdateDateColumn()
    public updatedAt?: Date

    @ManyToOne(() => User, user => user.targets)
    public owner?: User

    @Column()
    public status: TargetStatus;

    @Column()
    public name: string;

    @Column()
    public description: string;

    @Column(() => Timespan)
    public timespan: Timespan;

    @OneToMany(() => Action, action => action.target)
    public actions?: Action[];

    @OneToMany(() => TargetAttachment, attachment => attachment.attchedTo)
    public attachments?: TargetAttachment[]
}


@Entity()
export class TargetAttachment extends Attachment {
    @ManyToOne(() => TargetEntity, target => target.attachments)
    public attchedTo: TargetEntity
}
